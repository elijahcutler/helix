// src/components/AWSCredentialsForm.tsx
import React, { useState } from 'react';
import { regionsByArea } from '@/utils/awsRegions';

interface Props {
  onSubmit: (credentials: { accessKeyId: string; secretAccessKey: string; region: string }) => void;
}

const AWSCredentialsForm: React.FC<Props> = ({ onSubmit }) => {
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const isValidAccessKeyId = /^[A-Z0-9]{20}$/.test(accessKeyId);
  const isValidSecretKey = /^[A-Za-z0-9/+=]{40}$/.test(secretAccessKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAccessKeyId || !isValidSecretKey) {
      alert('Please enter valid AWS credentials.');
      return;
    }
    onSubmit({ accessKeyId, secretAccessKey, region: selectedRegion });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700">
          AWS Access Key ID
        </label>
        <input
          type="text"
          id="accessKeyId"
          value={accessKeyId}
          onChange={(e) => setAccessKeyId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700">
          AWS Secret Access Key
        </label>
        <input
          type="password"
          id="secretAccessKey"
          value={secretAccessKey}
          onChange={(e) => setSecretAccessKey(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
          AWS Region
        </label>
        <select
          id="region"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="" disabled>Select a region</option>
          {Object.entries(regionsByArea).map(([area, regions]) => (
            <optgroup key={area} label={area}>
              {regions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};

export default AWSCredentialsForm;