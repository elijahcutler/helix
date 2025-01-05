import { NextApiRequest, NextApiResponse } from 'next';
import { getContainerLogs } from '../../../services/dockerService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { containerId } = req.query;
    if (!containerId || typeof containerId !== 'string') {
      res.status(400).json({ error: 'Invalid container ID' });
      return;
    }

    try {
      const logs = await getContainerLogs(containerId);
      res.status(200).json({ logs });
    } catch (error) {
      console.error('Error fetching container logs:', error);
      res.status(500).json({ error: 'Failed to fetch container logs' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}