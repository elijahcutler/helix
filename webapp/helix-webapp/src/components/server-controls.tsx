'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Play, Square, RefreshCw, UserPlus } from 'lucide-react';
import { Server } from './Dashboard';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServerControlsProps {
  server: Server;
  refreshServers: () => void; // A callback to refresh the server list
}

export function ServerControls({ server, refreshServers }: ServerControlsProps) {
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApiCall = async (endpoint: string, method: 'POST' | 'GET', body: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify(body) : undefined,
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
  
      refreshServers(); // Refresh the server list after a successful operation
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to call ${endpoint}:`, error);
        alert(`Error: ${error.message}`);
      } else {
        console.error(`Unknown error occurred:`, error);
        alert(`An unknown error occurred`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => handleApiCall('/api/containers/start', 'POST', { containerId: server.id });
  const handleStop = () => handleApiCall('/api/containers/stop', 'POST', { containerId: server.id });
  const handleRestart = () => handleApiCall('/api/containers/restart', 'POST', { containerId: server.id });
  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this server?')) {
      handleApiCall('/api/containers/remove', 'POST', { containerId: server.id });
    }
  };

  const handleAddPlayer = () => {
    if (newPlayerName) {
      console.log(`Player ${newPlayerName} added to whitelist`); // Placeholder for actual implementation
      setNewPlayerName('');
      setIsAddPlayerOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleStart}>
            <Play className="mr-2 h-4 w-4" />
            <span>Start</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleStop}>
            <Square className="mr-2 h-4 w-4" />
            <span>Stop</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRestart}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Restart</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsAddPlayerOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Add Player</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemove}>
            <Square className="mr-2 h-4 w-4" />
            <span>Remove</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to Whitelist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player-name" className="text-right">
                Player Name
              </Label>
              <Input
                id="player-name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}