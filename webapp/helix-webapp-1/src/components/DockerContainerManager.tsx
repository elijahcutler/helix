"use client";

import { useState, useEffect } from 'react';

interface ContainerConfig {
  name: string;
  image: string;
  env?: string[];
  exposedPorts?: Record<string, {}>;
  portBindings?: Record<string, { HostPort: string }[]>;
}

interface Container {
  Id: string;
  Names: string[];
  State: string;
  Status: string;
  Image: string;
  Ports: { PublicPort: number }[];
}

export default function DockerContainerManager() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [newContainerConfig, setNewContainerConfig] = useState<ContainerConfig>({ name: '', image: 'itzg/minecraft-server' });
  const [serverVersion, setServerVersion] = useState('');
  const [gameMode, setGameMode] = useState('survival');
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/containers');
      const data = await response.json();
      if (Array.isArray(data)) {
        const containersWithStatus = await Promise.all(
          data
            .filter(container => container.Image === 'itzg/minecraft-server')
            .map(async (container) => {
              const statusResponse = await fetch(`/api/containers/status?containerId=${container.Id}`);
              const statusData = await statusResponse.json();
              return { ...container, Status: statusData.Status };
            })
        );
        setContainers(containersWithStatus);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching containers:', err);
      setError('Failed to fetch containers');
    } finally {
      setLoading(false);
    }
  };

  const createContainer = async (config: ContainerConfig) => {
    setLoading(true);
    try {
      const response = await fetch('/api/containers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      const newContainer = await response.json();
      pollContainerStatus(newContainer.Id);
    } catch (err) {
      setError('Failed to create container');
    } finally {
      setLoading(false);
    }
  };

  const pollContainerStatus = async (containerId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/containers/status?containerId=${containerId}`);
        const status = await response.json();
        if (status) {
          clearInterval(interval);
          fetchContainers();
        }
      } catch (err) {
        console.error('Error polling container status:', err);
      }
    }, 2000); // Poll every 2 seconds
  };

  const startContainer = async (containerId: string) => {
    setLoading(true);
    try {
      await fetch('/api/containers/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ containerId }),
      });
      fetchContainers();
    } catch (err) {
      setError('Failed to start container');
    } finally {
      setLoading(false);
    }
  };

  const stopContainer = async (containerId: string) => {
    setLoading(true);
    try {
      await fetch('/api/containers/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ containerId }),
      });
      fetchContainers();
    } catch (err) {
      setError('Failed to stop container');
    } finally {
      setLoading(false);
    }
  };

  const restartContainer = async (containerId: string) => {
    setLoading(true);
    try {
      await fetch('/api/containers/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ containerId }),
      });
      fetchContainers();
    } catch (err) {
      setError('Failed to restart container');
    } finally {
      setLoading(false);
    }
  };

  const removeContainer = async (containerId: string) => {
    if (window.confirm('Are you sure you want to remove this container?')) {
      setLoading(true);
      try {
        await fetch('/api/containers/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ containerId }),
        });
        fetchContainers();
      } catch (err) {
        setError('Failed to remove container');
      } finally {
        setLoading(false);
      }
    }
  };

  const getContainerStatus = async (containerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/containers/status?containerId=${containerId}`);
      const status = await response.json();
      return status;
    } catch (err) {
      setError('Failed to get container status');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContainer = (e: React.FormEvent) => {
    e.preventDefault();
    const env = [
      `VERSION=${serverVersion}`,
      `MODE=${gameMode}`,
      `DIFFICULTY=${difficulty}`,
      'MEMORY=2G',
      'EULA=TRUE',
    ];
    createContainer({ ...newContainerConfig, env });
    setShowCreateForm(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Docker Container Manager</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-blue-500 text-white p-2 mb-4"
      >
        + Create Server
      </button>
      {showCreateForm && (
        <form onSubmit={handleCreateContainer} className="mt-4">
          <input
            type="text"
            placeholder="Server Name"
            value={newContainerConfig.name}
            onChange={(e) => setNewContainerConfig({ ...newContainerConfig, name: e.target.value })}
            className="border p-2 mr-2"
            required
          />
          <input
            type="text"
            placeholder="Server Version"
            value={serverVersion}
            onChange={(e) => setServerVersion(e.target.value)}
            className="border p-2 mr-2"
            required
          />
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value)}
            className="border p-2 mr-2"
          >
            <option value="survival">Survival</option>
            <option value="creative">Creative</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border p-2 mr-2"
          >
            <option value="peaceful">Peaceful</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white p-2">Create Container</button>
        </form>
      )}
      {containers.length === 0 ? (
        <div>
          <p>No containers available.</p>
        </div>
      ) : (
        <ul className="space-y-4 mt-4">
          {containers.map((container) => (
            <li key={container.Id} className="border p-4">
              <div className="flex justify-between items-center">
                <span>{container.Names && container.Names[0] ? container.Names[0] : 'Unnamed Container'}</span>
                <span>Status: {container.Status}</span>
                <span>Port: {container.Ports && container.Ports[0] ? container.Ports[0].PublicPort : 'N/A'}</span>
                <div>
                  <button onClick={() => startContainer(container.Id)} className="bg-green-500 text-white p-2 mr-2">Start</button>
                  <button onClick={() => stopContainer(container.Id)} className="bg-red-500 text-white p-2 mr-2">Stop</button>
                  <button onClick={() => restartContainer(container.Id)} className="bg-yellow-500 text-white p-2 mr-2">Restart</button>
                  <button onClick={() => getContainerStatus(container.Id)} className="bg-gray-500 text-white p-2">Status</button>
                  <button onClick={() => removeContainer(container.Id)} className="bg-red-500 text-white p-2">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}