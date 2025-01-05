import { ServerItem } from "./server-item";
import { Server } from './Dashboard';

interface ServerListProps {
  servers: Server[];
  refreshServers: () => void; // Function to refresh the server list
}

export function ServerList({ servers, refreshServers }: ServerListProps) {
  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <ServerItem
          key={server.id}
          server={server}
          refreshServers={refreshServers}
        />
      ))}
    </div>
  );
}