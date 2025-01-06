import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';
import { backupContainer } from '@/services/dockerService';

interface Backup {
  id: string;
  serverId: string;
  date: string;
  size: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const backupDir = '/helix/minecraft-backups';
      console.log(`Reading backup directory: ${backupDir}`);

      if (!fs.existsSync(backupDir)) {
        console.error(`Backup directory does not exist: ${backupDir}`);
        return res.status(404).json({ error: 'Backup directory not found' });
      }

      const servers = await fs.readdir(backupDir);
      console.log(`Found server directories: ${servers}`);

      const allBackups: Backup[] = [];
      for (const serverName of servers) {
        try {
          const serverBackupPath = path.join(backupDir, serverName);
          console.log(`Checking backups for server: ${serverName}`);

          if (!fs.existsSync(serverBackupPath)) {
            console.warn(`Server backup directory not found: ${serverBackupPath}`);
            continue;
          }

          const backups = await fs.readdir(serverBackupPath);
          backups.forEach((backupFile) => {
            try {
              const filePath = path.join(serverBackupPath, backupFile);
              const stats = fs.statSync(filePath);

              allBackups.push({
                id: backupFile,
                serverId: serverName,
                date: stats.mtime.toISOString(),
                size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
              });
            } catch (fileError) {
              console.error(`Failed to process backup file: ${backupFile}`, fileError);
            }
          });
        } catch (serverError) {
          console.error(`Failed to process server directory: ${serverName}`, serverError);
        }
      }

      res.status(200).json({ backups: allBackups });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching backups:', error.message);
        res.status(500).json({ error: 'Failed to fetch backups', details: error.message });
      } else {
        console.error('Unknown error occurred while fetching backups:', error);
        res.status(500).json({ error: 'Failed to fetch backups', details: 'An unknown error occurred' });
      }
    }
  } else if (req.method === 'POST') {
    const { containerId, serverName } = req.body;

    if (!containerId || !serverName) {
      console.error('Missing containerId or serverName in request body');
      return res.status(400).json({ error: 'Invalid request: containerId and serverName are required' });
    }

    try {
      console.log(`Creating backup for container: ${containerId}, server: ${serverName}`);
      const backupPath = await backupContainer(containerId, serverName);

      if (!fs.existsSync(backupPath)) {
        console.error(`Backup file not found after creation: ${backupPath}`);
        return res.status(500).json({ error: 'Backup creation failed' });
      }

      const stats = fs.statSync(backupPath);
      res.status(200).json({
        backup: {
          id: path.basename(backupPath),
          serverId: serverName,
          date: stats.mtime.toISOString(),
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Backup creation failed:', error.message);
        res.status(500).json({ error: 'Failed to create backup', details: error.message });
      } else {
        console.error('Unknown error occurred during backup creation:', error);
        res.status(500).json({ error: 'Failed to create backup', details: 'An unknown error occurred' });
      }
    }
  } else {
    console.warn(`Method not allowed: ${req.method}`);
    res.status(405).json({ error: 'Method not allowed' });
  }
}