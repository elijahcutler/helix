import { NextApiRequest, NextApiResponse } from 'next';
import { getContainerStatus } from '../../../services/dockerService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { containerId } = req.query;
    try {
      const status = await getContainerStatus(containerId as string);
      res.status(200).json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get container status' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};