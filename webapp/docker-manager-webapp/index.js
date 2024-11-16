require('dotenv').config();
const express = require('express');
const Docker = require('dockerode');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');

const docker = new Docker({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });
const app = express();
const mcContainerName = process.env.MC_CONTAINER_NAME;
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Enhanced logging for server status
app.get('/status', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const mcContainer = containers.find(c => c.Names.includes(`/${mcContainerName}`));
    if (mcContainer && mcContainer.State === 'running') {
      console.log('Server Status: Running');
      res.json({ status: 'running', uptime: mcContainer.Status });
    } else {
      console.log('Server Status: Stopped');
      res.json({ status: 'stopped' });
    }
  } catch (err) {
    console.error('Error fetching server status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start, stop, and restart Minecraft server
app.post('/start', async (req, res) => {
  try {
    const container = docker.getContainer(mcContainerName);
    await container.start();
    console.log('Server started');
    res.json({ status: 'started' });
  } catch (err) {
    console.error('Error starting server:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/stop', async (req, res) => {
  try {
    const container = docker.getContainer(mcContainerName);
    await container.stop();
    console.log('Server stopped');
    res.json({ status: 'stopped' });
  } catch (err) {
    console.error('Error stopping server:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/restart', async (req, res) => {
  try {
    const container = docker.getContainer(mcContainerName);
    await container.restart();
    console.log('Server restarted');
    res.json({ status: 'restarted' });
  } catch (err) {
    console.error('Error restarting server:', err);
    res.status(500).json({ error: err.message });
  }
});

// World info with enhanced error handling and logging
app.get('/world-info', (req, res) => {
  const worldPath = path.join(process.env.WORLD_DIR);
  const playerDataPath = path.join(worldPath, 'playerdata');

  console.log('World Path:', worldPath);
  console.log('Player Data Path:', playerDataPath);

  fs.access(worldPath, fs.constants.R_OK, (err) => {
    if (err) {
      console.error('World directory cannot be read:', err);
      return res.status(500).json({ error: 'World directory cannot be accessed. Check path and permissions.' });
    }

    fs.readdir(worldPath, (err, files) => {
      if (err) {
        console.error('Error reading world directory:', err);
        return res.status(500).json({ error: 'Unable to read world directory contents.' });
      }

      let totalSize = 0;
      let lastModified = new Date(0);

      files.forEach(file => {
        const filePath = path.join(worldPath, file);
        try {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          if (stats.mtime > lastModified) lastModified = stats.mtime;
        } catch (fileError) {
          console.error(`Error accessing file ${filePath}:`, fileError);
        }
      });

      fs.readdir(playerDataPath, (err, playerFiles) => {
        if (err) {
          console.error('Error reading player data directory:', err);
          return res.status(500).json({ error: 'Unable to retrieve player information. Check player data path and permissions.' });
        }

        // Filter out .dat_old files
        const filteredPlayerFiles = playerFiles.filter(file => file.endsWith('.dat') && !file.endsWith('.dat_old'));

        const playerCount = filteredPlayerFiles.length;

        res.json({
          size: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
          lastModified: lastModified,
          playerCount: playerCount,
        });
      });
    });
  });
});

// Upload world files
app.post('/upload', upload.single('world'), async (req, res) => {
  try {
    const worldZipPath = req.file.path;
    const extractPath = process.env.WORLD_DIR;

    await extract(worldZipPath, { dir: extractPath });
    fs.unlinkSync(worldZipPath);
    console.log('World uploaded and extracted successfully.');
    res.json({ message: 'World uploaded and extracted successfully.' });
  } catch (err) {
    console.error('Error uploading world:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
