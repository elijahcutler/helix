"use client";

import React, { useState, useEffect } from 'react';
import { useEC2Instances } from '../../../hooks/useEC2Instances';
import { useUptime } from '../../../hooks/useUptime';
import AWSAuthorization from '../authentication/AWSAuthorization';
import { capitalize } from '../../../utils/capitalize';

const Dashboard: React.FC = () => {
  const [credentials, setCredentials] = useState<{
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  } | null>(null);

  // Retrieve stored credentials on page load
  useEffect(() => {
    const storedCredentials = localStorage.getItem('awsCredentials');
    if (storedCredentials) {
      setCredentials(JSON.parse(storedCredentials));
    }
  }, []);

  const { instances, loading, error } = useEC2Instances(credentials);

  const handleAuthorization = (creds: { accessKeyId: string; secretAccessKey: string; region: string }) => {
    setCredentials(creds);
    localStorage.setItem('awsCredentials', JSON.stringify(creds)); // Store credentials in localStorage
  };

  const clearCredentials = () => {
    localStorage.removeItem('awsCredentials');
    setCredentials(null);
  };

  return (
    <div className="p-4">
      {!credentials ? (
        <AWSAuthorization onAuthorize={handleAuthorization} />
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">EC2 Instances</h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {instances.length > 0 ? (
            <table className="min-w-full bg-white dark:bg-black">
              <thead>
                <tr>
                  <th className="py-2">Instance Name</th>
                  <th className="py-2">State / Uptime</th>
                  <th className="py-2">Public IP</th>
                </tr>
              </thead>
              <tbody>
                {instances.map(instance => (
                  <tr key={instance.instanceId}>
                    <td className="border px-4 py-2">{instance.instanceName}</td>
                    <td className="border px-4 py-2">
                      {instance.state === 'running'
                        ? `Running (${useUptime(instance.launchTime)})`
                        : capitalize(instance.state)}
                    </td>
                    <td className="border px-4 py-2">{instance.publicIp || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No EC2 instances found.</p>
          )}
          <button onClick={clearCredentials} className="mt-4 text-red-600 hover:underline">
            Clear Stored Credentials
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;