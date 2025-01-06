'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServerControls } from "./server-controls";
import { Server } from './Dashboard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServerItemProps {
  server: Server;
  refreshServers: () => void; // A callback to refresh the server list
}

export function ServerItem({ server, refreshServers }: ServerItemProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [players, setPlayers] = useState<string[]>(server.players);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);

  const statusColor = {
    running: "bg-green-500 dark:bg-green-700",
    stopped: "bg-yellow-500 dark:bg-yellow-700",
    error: "bg-red-500 dark:bg-red-700"
  };

  // Fetch logs when accordion is expanded
  useEffect(() => {
    if (isLogsExpanded) {
      setLoadingLogs(true);
      fetch(`/api/containers/logs?containerId=${server.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.logs)) {
            setLogs(data.logs);
          } else if (typeof data.logs === 'string') {
            setLogs(data.logs.split('\n').filter((line: string) => line.trim() !== ''));
          } else {
            throw new Error('Invalid logs format');
          }
        })
        .catch((err) => setLogError(err.message))
        .finally(() => setLoadingLogs(false));
    }
  }, [isLogsExpanded, server.id]);

  const addPlayer = (player: string) => {
    setPlayers((prev) => [...prev, player]);
  };

  const removePlayer = (player: string) => {
    setPlayers((prev) => prev.filter((p) => p !== player));
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{server.name}</CardTitle>
        <ServerControls server={server} refreshServers={refreshServers} />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Port: {server.port}</p>
            <p className="text-sm text-muted-foreground">Version: {server.version}</p>
          </div>
          <Badge className={`${statusColor[server.status]} text-white`}>
            {server.status}
          </Badge>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {/* Players Accordion */}
          <AccordionItem value="players">
            <AccordionTrigger>Players ({players.length})</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[100px] w-full rounded-md border p-4">
                {players.map((player, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span>{player}</span>
                    <Badge
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => removePlayer(player)}
                    >
                      Kick
                    </Badge>
                  </div>
                ))}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          {/* Logs Accordion */}
          <AccordionItem
            value="logs"
            onClick={() => setIsLogsExpanded((prev) => !prev)}
          >
            <AccordionTrigger>Server Logs</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                {loadingLogs ? (
                  <p>Loading logs...</p>
                ) : logError ? (
                  <p className="text-red-500">Error loading logs: {logError}</p>
                ) : logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="py-1">
                      <span className="text-sm">{log}</span>
                    </div>
                  ))
                ) : (
                  <p>No logs available.</p>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}