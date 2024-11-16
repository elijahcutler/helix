import { useState, useEffect } from 'react';
import { EC2Instance } from '../types/EC2Instance';

export const useEC2Instances = (credentials: { accessKeyId: string; secretAccessKey: string; region: string } | null) => {
  const [instances, setInstances] = useState<EC2Instance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!credentials) return; // Skip the hook's effect if credentials are null

    const fetchInstances = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ec2-status', {
          method: 'GET',
          headers: {
            'x-access-key-id': credentials.accessKeyId,
            'x-secret-access-key': credentials.secretAccessKey,
            'x-region': credentials.region,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch EC2 instances');
        }
        const data = await response.json();
        setInstances(data.instances || []);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, [credentials]);

  return { instances, loading, error };
};