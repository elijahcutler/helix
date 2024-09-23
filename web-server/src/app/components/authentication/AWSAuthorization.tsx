"use client";

import React, { useState } from 'react';
import AWSCredentialsForm from './AWSCredentialsForm';
import { regionsByArea } from '@/utils/awsRegions';

interface AWSAuthorizationProps {
  onAuthorize: (credentials: { accessKeyId: string; secretAccessKey: string; region: string }) => void;
}

const AWSAuthorization: React.FC<AWSAuthorizationProps> = ({ onAuthorize }) => {
  const [authMethod, setAuthMethod] = useState<'manual' | 'csv' | 'json' | null>(null);
  const [credentials, setCredentials] = useState<{
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  } | null>(null);
  const [region, setRegion] = useState<string>('');
  const [customRegion, setCustomRegion] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = (creds: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }) => {
    setCredentials(creds);
    onAuthorize(creds);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'json' | 'csv') => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'json') {
          try {
            const parsedCredentials = JSON.parse(e.target?.result as string);
            setCredentials({
              accessKeyId: parsedCredentials.AWS_ACCESS_KEY_ID,
              secretAccessKey: parsedCredentials.AWS_SECRET_ACCESS_KEY,
              region: parsedCredentials.AWS_REGION,
            });
            onAuthorize({
              accessKeyId: parsedCredentials.AWS_ACCESS_KEY_ID,
              secretAccessKey: parsedCredentials.AWS_SECRET_ACCESS_KEY,
              region: parsedCredentials.AWS_REGION,
            });
          } catch (err) {
            setError("Invalid JSON file");
          }
        } else if (type === 'csv') {
          try {
            const csv = e.target?.result as string;
            const [header, values] = csv.split('\n');
            const [accessKeyId, secretAccessKey] = values.split(',');

            if (accessKeyId && secretAccessKey) {
              setCredentials({
                accessKeyId: accessKeyId.trim(),
                secretAccessKey: secretAccessKey.trim(),
                region: '', // Region will be selected later
              });
            } else {
              setError("Invalid CSV format");
            }
          } catch (err) {
            setError("Error processing CSV file");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleBack = () => {
    setAuthMethod(null);
    setError(null);
  };

  const handleRegionSelect = (selectedRegion: string) => {
    if (selectedRegion === 'other') {
      setRegion('');
      setCustomRegion('');
    } else {
      setRegion(selectedRegion);
      setCustomRegion('');
      if (credentials) {
        onAuthorize({
          ...credentials,
          region: selectedRegion,
        });
      }
    }
  };

  const handleCustomRegionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setCustomRegion(value);
    if (credentials) {
      onAuthorize({
        ...credentials,
        region: value,
      });
    }
  };

  return (
    <div>
      {!authMethod ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold mb-4">Authorize with AWS</h1>
          <button
            onClick={() => setAuthMethod('manual')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Enter Credentials Manually
          </button>
          <button
            onClick={() => setAuthMethod('csv')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Upload AWS Access Key CSV
          </button>
          <button
            onClick={() => setAuthMethod('json')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Upload JSON Credentials File
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setAuthMethod(null)}
            className="mb-4 text-blue-600 hover:underline"
          >
            ← Back
          </button>
          {authMethod === 'manual' && (
            <AWSCredentialsForm onSubmit={handleCredentialsSubmit} />
          )}
          {authMethod === 'csv' && (
            <div className="mt-4">
              <label htmlFor="csv-file-upload" className="block text-sm font-medium text-gray-700">
                Upload AWS CSV Credentials File
              </label>
              <input
                type="file"
                id="csv-file-upload"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'csv')}
                className="mt-2 p-2 border border-gray-300 rounded-md"
              />
              {credentials && !credentials.region && (
                <div className="mt-4">
                  <label htmlFor="region-select" className="block text-sm font-medium text-gray-700">
                    Select AWS Region
                  </label>
                  <select
                    id="region-select"
                    value={region}
                    onChange={(e) => handleRegionSelect(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                  {region === '' && (
                    <div className="mt-4">
                      <label htmlFor="custom-region" className="block text-sm font-medium text-gray-700">
                        Enter Custom AWS Region
                      </label>
                      <input
                        type="text"
                        id="custom-region"
                        value={customRegion}
                        onChange={handleCustomRegionInput}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., ap-south-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {authMethod === 'json' && (
            <div className="mt-4">
              <label htmlFor="json-file-upload" className="block text-sm font-medium text-gray-700">
                Upload JSON Credentials File
              </label>
              <input
                type="file"
                id="json-file-upload"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'json')}
                className="mt-2 p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default AWSAuthorization;