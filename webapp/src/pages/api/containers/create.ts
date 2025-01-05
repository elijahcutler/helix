import { NextApiRequest, NextApiResponse } from 'next';
import { createContainer } from '../../../services/dockerService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const config = req.body;
    try {
      const container = await createContainer({
        ...config,
        image: 'itzg/minecraft-server',
        env: config.env || ['EULA=TRUE'],
      });
      res.status(200).json(container);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create container' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};