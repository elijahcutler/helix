import { useState, useEffect } from "react";
import { BackupServer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Backup {
  id: string;
  serverId: string;
  date: string;
  size: string;
}

interface ServerBackupsProps {
  servers: BackupServer[];
}

export function ServerBackups({ servers }: ServerBackupsProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/containers/backups");
      if (!response.ok) {
        throw new Error("Failed to fetch backups");
      }
      const { backups } = await response.json();
      setBackups(backups);
    } catch (error) {
      console.error("Error fetching backups:", error);
    }
  };

  useEffect(() => {
    fetchBackups(); // Reuse fetchBackups function
  }, []);

  const createBackup = async (serverId: string, serverName: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/containers/backups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ containerId: serverId, serverName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create backup");
      }

      const { backup } = await response.json();
      setBackups((prev) => [...prev, backup]);
    } catch (error) {
      console.error("Error creating backup:", error);
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupId: string, serverId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/containers/backups/${backupId}/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverId }),
      });

      if (!response.ok) {
        throw new Error("Failed to restore backup");
      }

      alert("Backup restored successfully!");
    } catch (error) {
      console.error("Error restoring backup:", error);
      alert("Failed to restore backup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <Card key={server.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{server.name}</CardTitle>
            <Button
              onClick={() => createBackup(server.id, server.name)}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Backup"}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups
                  .filter((backup) => backup.serverId === server.id)
                  .map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>{backup.date}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBackup(backup.id, server.id)}
                          disabled={loading}
                        >
                          {loading ? "Restoring..." : "Restore"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}