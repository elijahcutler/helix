'use client'

import { useState, useEffect } from "react";
import { ServerBackups } from "@/components/server-backups";
import { BackupServer } from "@/types";

export default function BackupsPage() {
  const [servers, setServers] = useState<BackupServer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/containers");
        const data = await response.json();
  
        if (Array.isArray(data)) {
          const serverData = data
            .filter((container) => container.Image === "itzg/minecraft-server") // Filter by image
            .map((container) => ({
              id: container.Id,
              name: container.Names[0], // Display the first name in Names array
            }));
          setServers(serverData);
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchServers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Server Backups</h1>
        <ServerBackups servers={servers} />
      </main>
    </div>
  );
}