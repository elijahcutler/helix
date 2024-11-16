require('dotenv').config();
const express = require('express');
const Docker = require('dockerode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const docker = new Docker({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });
const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Validate memory format (e.g., 2G, 1024M)
const validateMemory = (value) => /^[1-8]G$/.test(value);

// Create a new Minecraft server container
app.post('/create-container', async (req, res) => {
  const { name, envVars } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Container name is required.' });
  }

  if (envVars.MEMORY && !validateMemory(envVars.MEMORY)) {
    return res.status(400).json({ error: 'Invalid MEMORY format. Use values like "1G", "2G", up to "8G".' });
  }

  try {
    console.log('Creating container with:', { name, envVars });

    // Check for duplicate container name
    const existingContainers = await docker.listContainers({ all: true });
    if (existingContainers.some(container => container.Names.includes(`/${name}`))) {
      console.log(`Container with name "${name}" already exists.`);
      return res.status(400).json({ error: `A container with the name "${name}" already exists.` });
    }

    // Add default environment variables
    const finalEnvVars = {
      EULA: 'TRUE',
      MEMORY: '2G', // Default memory allocation
      ...envVars, // User-provided environment variables
    };

    const containerConfig = {
      Image: `itzg/minecraft-server:latest`, // Use latest image
      name,
      Env: Object.entries(finalEnvVars).map(([key, value]) => `${key}=${value}`),
      HostConfig: {
        Binds: [`/path/to/data/${name}:/data`],
        PortBindings: {
          '25565/tcp': [{ HostPort: `${Math.floor(25565 + Math.random() * 100)}` }],
        },
      },
    };

    console.log('Container configuration:', containerConfig);

    const container = await docker.createContainer(containerConfig);
    await container.start();

    const createdAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO containers (id, name, createdAt, status) VALUES (?, ?, ?, ?)`
    ).run(container.id, name, createdAt, 'running');

    console.log(`Container "${name}" created successfully.`);
    res.json({ message: `Container "${name}" created successfully.` });
  } catch (err) {
    console.error('Error during container creation:', err);
    res.status(500).json({ error: 'Failed to create container. Check server logs for details.' });
  }
});

// List all tracked containers
app.get('/list-containers', (req, res) => {
  try {
    const containers = db.prepare('SELECT * FROM containers').all();
    res.json(containers);
  } catch (err) {
    console.error('Error fetching containers:', err);
    res.status(500).json({ error: 'Failed to retrieve containers.' });
  }
});

// Other container management routes remain unchanged
// ...
// Start server
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));