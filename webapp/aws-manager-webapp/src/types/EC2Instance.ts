export type EC2Instance = {
    instanceId: string;
    instanceName: string;
    instanceType: string;
    state: string;
    publicIp: string | null;
    privateIp: string | null;
    launchTime: string;
  };