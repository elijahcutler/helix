import { NextApiRequest, NextApiResponse } from 'next';
import { removeContainer } from '../../../services/dockerService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { containerId } = req.body;
    try {
      await removeContainer(containerId);
      res.status(200).json({ message: 'Container removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove container' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};