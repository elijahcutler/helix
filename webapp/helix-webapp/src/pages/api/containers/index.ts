import { NextApiRequest, NextApiResponse } from 'next';
import { listContainers } from '../../../services/dockerService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const containers = await listContainers();
      res.status(200).json(containers);
    } catch (error) {
      console.error('Error listing containers:', error);
      res.status(500).json({ error: 'Failed to list containers' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};