// src/components/AWSCredentialsForm.tsx
import React, { useState } from 'react';

interface Props {
  onSubmit: (credentials: { accessKeyId: string; secretAccessKey: string; region: string }) => void;
}

const regionsByArea = {
  "US East": [
    { label: "US East (N. Virginia) - us-east-1", value: "us-east-1" },
    { label: "US East (Ohio) - us-east-2", value: "us-east-2" },
  ],
  "US West": [
    { label: "US West (N. California) - us-west-1", value: "us-west-1" },
    { label: "US West (Oregon) - us-west-2", value: "us-west-2" },
  ],
  "Asia Pacific": [
    { label: "Asia Pacific (Mumbai) - ap-south-1", value: "ap-south-1" },
    { label: "Asia Pacific (Singapore) - ap-southeast-1", value: "ap-southeast-1" },
    { label: "Asia Pacific (Sydney) - ap-southeast-2", value: "ap-southeast-2" },
    { label: "Asia Pacific (Tokyo) - ap-northeast-1", value: "ap-northeast-1" },
  ],
  "Europe": [
    { label: "Europe (Frankfurt) - eu-central-1", value: "eu-central-1" },
    { label: "Europe (Ireland) - eu-west-1", value: "eu-west-1" },
    { label: "Europe (London) - eu-west-2", value: "eu-west-2" },
    { label: "Europe (Paris) - eu-west-3", value: "eu-west-3" },
  ],
  "South America": [
    { label: "South America (São Paulo) - sa-east-1", value: "sa-east-1" },
  ],
  // Add more regions as needed
};

const AWSCredentialsForm: React.FC<Props> = ({ onSubmit }) => {
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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