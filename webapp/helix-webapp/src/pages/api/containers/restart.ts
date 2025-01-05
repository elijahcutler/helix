import { NextApiRequest, NextApiResponse } from 'next';
import { restartContainer } from '../../../services/dockerService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { containerId } = req.body;
    try {
      await restartContainer(containerId);
      res.status(200).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to restart container' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};