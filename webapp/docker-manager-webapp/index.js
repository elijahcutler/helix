require('dotenv').config();
const express = require('express');
const Docker = require('dockerode');

const docker = new Docker({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });
const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());

// In-memory container tracker
const containers = [];

// Generate unique port to avoid conflicts
function generateUniquePort() {
  let port;
  const usedPorts = containers.map(c => parseInt(c.hostPort));
  do {
    port = Math.floor(25565 + Math.random() * 100);
  } while (usedPorts.includes(port));
  return port;
}

// Validate memory format (e.g., 2G, 1024M)
const validateMemory = (value) => /^[1-8]G$/.test(value);

// Create a new Minecraft server container
app.post('/create-container', async (req, res) => {
  const { name, envVars } = req.body;

  if (!name || !envVars.VERSION || !envVars.TYPE) {
    return res.status(400).json({ error: 'Container name, Minecraft version, and server type are required.' });
  }

  try {
    console.log('Creating container with:', { name, envVars });

    if (containers.some(container => container.name === name)) {
      return res.status(400).json({ error: `A container with the name "${name}" already exists.` });
    }

    const persistentServerDir = process.env.PERSISTENT_SERVER_DIR || '/helix/minecraft-data';

    const finalEnvVars = {
      EULA: 'TRUE', // Always required
      MEMORY: envVars.MEMORY || '2G', // Default memory allocation
      ...envVars, // User-provided variables
    };

    const containerConfig = {
      Image: `itzg/minecraft-server:latest`,
      name,
      Env: Object.entries(finalEnvVars).map(([key, value]) => `${key}=${value}`),
      HostConfig: {
        Binds: [`${persistentServerDir}/${name}:/data`],
        PortBindings: {
          '25565/tcp': [{ HostPort: `${generateUniquePort()}` }],
        },
      },
    };

    console.log('Container configuration:', containerConfig);

    const container = await docker.createContainer(containerConfig);
    await container.start();

    containers.push({
      id: container.id,
      name,
      createdAt: new Date().toISOString(),
      status: 'running',
    });

    res.json({ message: `Container "${name}" created successfully.` });
  } catch (err) {
    console.error('Error during container creation:', err);
    res.status(500).json({ error: 'Failed to create container. Check server logs for details.' });
  }
});

// List all tracked containers
app.get('/list-containers', (req, res) => {
  res.json(containers);
});

// Server metrics
app.get('/server-metrics/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const container = docker.getContainer(id);
    const stats = await container.stats({ stream: false });

    const metrics = {
      memoryUsage: `${(stats.memory_stats.usage / 1024 / 1024).toFixed(2)} MB`,
      cpuUsage: `${stats.cpu_stats.cpu_usage.total_usage} CPU units`,
    };

    res.json(metrics);
  } catch (err) {
    console.error('Error fetching server metrics:', err);
    res.status(500).json({ error: 'Failed to fetch server metrics.' });
  }
});

// Start server
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));