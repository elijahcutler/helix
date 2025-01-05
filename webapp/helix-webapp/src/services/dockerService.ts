import Docker from 'dockerode';
import dotenv from 'dotenv';

dotenv.config();

const docker = new Docker({
  host: process.env.DOCKER_HOST_IP,
  port: 2375,
});

interface ContainerConfig {
  image: string;
  name: string;
  env?: string[];
  exposedPorts?: Record<string, {}>;
  portBindings?: Record<string, { HostPort: string }[]>;
}

const getRandomPort = async (): Promise<string> => {
  const usedPorts = new Set<number>();
  const containers = await docker.listContainers({ all: true });
  containers.forEach(container => {
    if (container.Ports) {
      container.Ports.forEach(port => {
        usedPorts.add(port.PublicPort);
      });
    }
  });

  let port;
  do {
    port = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  } while (usedPorts.has(port));

  return port.toString();
};

export const createContainer = async (config: ContainerConfig): Promise<Docker.Container> => {
  try {
    const containers = await docker.listContainers({ all: true });
    const isPortUsed = containers.some(container =>
      container.Ports.some(port => port.PublicPort === 25565)
    );

    const hostPort = isPortUsed ? await getRandomPort() : '25565';

    const container = await docker.createContainer({
      Image: config.image || 'itzg/minecraft-server',
      name: config.name,
      Env: config.env,
      ExposedPorts: {
        '25565/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '25565/tcp': [{ HostPort: hostPort }],
        },
        Binds: [`/helix/minecraft-data/${config.name}:/data`],
      },
    });
    await container.start();
    return container;
  } catch (error) {
    console.error('Error creating container:', error);
    throw error;
  }
};

export const removeContainer = async (containerId: string): Promise<void> => {
  try {
    const container = docker.getContainer(containerId);
    await container.remove();
  } catch (error) {
    console.error('Error removing container:', error);
    throw error;
  }
};

export const listContainers = async (): Promise<Docker.ContainerInfo[]> => {
  try {
    const containers = await docker.listContainers({ all: true });
    return Array.isArray(containers) ? containers : [];
  } catch (error) {
    console.error('Error listing containers:', error);
    throw error;
  }
};

export const startContainer = async (containerId: string): Promise<void> => {
  try {
    const container = docker.getContainer(containerId);
    await container.start();
  } catch (error) {
    console.error('Error starting container:', error);
    throw error;
  }
};

export const stopContainer = async (containerId: string): Promise<void> => {
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
  } catch (error) {
    console.error('Error stopping container:', error);
    throw error;
  }
};

export const restartContainer = async (containerId: string): Promise<void> => {
  try {
    const container = docker.getContainer(containerId);
    await container.restart();
  } catch (error) {
    console.error('Error restarting container:', error);
    throw error;
  }
};

export const getContainerStatus = async (containerId: string): Promise<Docker.ContainerInspectInfo['State']> => {
  try {
    const container = docker.getContainer(containerId);
    const data = await container.inspect();
    return data.State;
  } catch (error) {
    console.error('Error getting container status:', error);
    throw error;
  }
};

export async function getContainerLogs(containerId: string, tail: number = 100): Promise<string[]> {
  try {
    const container = docker.getContainer(containerId);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true,
    });

    // Ensure logs are split into lines
    return logs.toString('utf-8').split('\n').filter((line) => line.trim() !== '');
  } catch (error) {
    console.error(`Error fetching logs for container ${containerId}:`, error);
    throw new Error('Failed to fetch container logs');
  }
}

/**
 * Cleans and formats individual log entries.
 */
function cleanLogEntry(log: string): string {
  return log.replace(/^[\u0000-\u001f\u007f-\u009f]+/, ''); // Remove control characters
}