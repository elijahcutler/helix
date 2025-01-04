import DockerContainerManager from '@/components/DockerContainerManager';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">helix</h1>
      <DockerContainerManager />
    </div>
  );
}