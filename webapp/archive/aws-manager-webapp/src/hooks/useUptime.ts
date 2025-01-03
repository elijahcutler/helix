export const useUptime = (launchTime: string) => {
  const launchDate = new Date(launchTime);
  const now = new Date();
  const uptime = now.getTime() - launchDate.getTime();

  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d ${hours}h ${minutes}m`;
};