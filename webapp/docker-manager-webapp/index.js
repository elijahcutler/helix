require('dotenv').config();
const express = require('express');
const Docker = require('dockerode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const extract = require('extract-zip');

const docker = new Docker({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });
const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.static('public'));
app.use(express.json());

// In-memory container tracker (now persisted via SQLite)
const trackedContainers = [];

// Create a new Minecraft server container
app.post('/create-container', async (req, res) => {
  const { name, version, envVars } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Container name is required.' });
  }

  try {
    const containerConfig = {
      Image: `itzg/minecraft-server:${version || 'latest'}`,
      name,
      Env: Object.entries(envVars || {}).map(([key, value]) => `${key}=${value}`),
      HostConfig: {
        Binds: [
          `/path/to/data/${name}:/data`, // Adjust the path for your setup
        ],
        PortBindings: {
          '25565/tcp': [{ HostPort: `${Math.floor(25565 + Math.random() * 100)}` }],
        },
      },
    };

    const container = await docker.createContainer(containerConfig);
    await container.start();

    const createdAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO containers (id, name, version, createdAt, status) VALUES (?, ?, ?, ?, ?)`
    ).run(container.id, name, version || 'latest', createdAt, 'running');

    console.log(`Created container: ${name}`);
    res.json({ message: `Container ${name} created successfully.` });
  } catch (err) {
    console.error('Error creating container:', err);
    res.status(500).json({ error: 'Failed to create container.' });
  }
});

// List all tracked containers
app.get('/list-containers', (req, res) => {
  const containers = db.prepare('SELECT * FROM containers').all();
  res.json(containers);
});

// Stop a container
app.post('/stop-container', async (req, res) => {
  const { id } = req.body;

  try {
    const container = docker.getContainer(id);
    await container.stop();

    db.prepare(`UPDATE containers SET status = ? WHERE id = ?`).run('stopped', id);
    res.json({ message: 'Container stopped successfully.' });
  } catch (err) {
    console.error('Error stopping container:', err);
    res.status(500).json({ error: 'Failed to stop container.' });
  }
});

// Start a container
app.post('/start-container', async (req, res) => {
  const { id } = req.body;

  try {
    const container = docker.getContainer(id);
    await container.start();

    db.prepare(`UPDATE containers SET status = ? WHERE id = ?`).run('running', id);
    res.json({ message: 'Container started successfully.' });
  } catch (err) {
    console.error('Error starting container:', err);
    res.status(500).json({ error: 'Failed to start container.' });
  }
});

// Delete a container
app.post('/delete-container', async (req, res) => {
  const { id } = req.body;

  try {
    const container = docker.getContainer(id);
    await container.stop();
    await container.remove();

    db.prepare(`DELETE FROM containers WHERE id = ?`).run(id);
    res.json({ message: 'Container deleted successfully.' });
  } catch (err) {
    console.error('Error deleting container:', err);
    res.status(500).json({ error: 'Failed to delete container.' });
  }
});

// View logs of a container
app.get('/container-logs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const container = docker.getContainer(id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      timestamps: true,
    });

    res.json({ logs: logs.toString() });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to fetch container logs.' });
  }
});

// Start server
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
