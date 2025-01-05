'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { ServerList } from "./server-list";
import { CreateServerDialog } from "./create-server-dialog";
import { Header } from "./Header";

export interface Server {
  id: string;
  name: string;
  port: number;
  version: string;
  status: "running" | "stopped" | "error";
  players: string[];
  logs: string[];
}

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch servers from API
  const fetchServers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/containers');
      const data = await response.json();
      if (Array.isArray(data)) {
        const fetchedServers = await Promise.all(
          data
            .filter(container => container.Image === 'itzg/minecraft-server')
            .map(async (container) => {
              const statusResponse = await fetch(`/api/containers/status?containerId=${container.Id}`);
              const statusData = await statusResponse.json();
              return {
                id: container.Id,
                name: container.Names?.[0] || "Unnamed Server",
                port: container.Ports?.[0]?.PublicPort || 0,
                version: "Unknown", // Placeholder until version is implemented
                status: statusData.Status || "unknown",
                players: [], // Placeholder until players are implemented
                logs: [] // Placeholder until logs are implemented
              };
            })
        );
        setServers(fetchedServers);
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching servers:", err);
      setError("Failed to fetch servers");
    } finally {
      setLoading(false);
    }
  };

  // Add a new server
  const addServer = async (newServerConfig: { name: string; version: string }) => {
    setLoading(true);
    try {
      const config = {
        name: newServerConfig.name,
        image: 'itzg/minecraft-server',
        env: [
          `VERSION=${newServerConfig.version}`,
          'MODE=survival',
          'DIFFICULTY=easy',
          'MEMORY=2G',
          'EULA=TRUE',
        ],
      };
      const response = await fetch('/api/containers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      const newContainer = await response.json();
      await fetchServers(); // Refresh server list
    } catch (err) {
      console.error("Error adding server:", err);
      setError("Failed to add server");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchServers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Minecraft Servers</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create new server
          </Button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ServerList servers={servers} refreshServers={fetchServers} />
        <CreateServerDialog
          isOpen={isCreateDialogOpen}
          setIsOpen={setIsCreateDialogOpen}
          onCreateServer={(newServer) => {
            addServer(newServer);
            setIsCreateDialogOpen(false);
          }}
        />
      </main>
    </div>
  );
}