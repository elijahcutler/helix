'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "./Header"

export function Settings() {
  const [dockerIp, setDockerIp] = useState('')
  const [dockerPort, setDockerPort] = useState('')
  const [enableTls, setEnableTls] = useState(false)
  const [storagePath, setStoragePath] = useState('')

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Docker Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="docker-ip">Docker Server IP</Label>
                <Input 
                  id="docker-ip" 
                  value={dockerIp} 
                  onChange={(e) => setDockerIp(e.target.value)} 
                  placeholder="e.g. 192.168.1.100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docker-port">Docker Server Port (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">Default Port: 2375; If using TLS, change to 2376</p>
                <Input 
                  id="docker-port" 
                  value={dockerPort} 
                  onChange={(e) => setDockerPort(e.target.value)} 
                  placeholder="e.g. 2376"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="enable-tls" 
                checked={enableTls} 
                onCheckedChange={setEnableTls}
              />
              <Label htmlFor="enable-tls">Enable TLS</Label>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ca-cert">CA Certificate</Label>
                <Input 
                  id="ca-cert" 
                  type="file" 
                  disabled={!enableTls}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-cert">Client Certificate</Label>
                <Input 
                  id="client-cert" 
                  type="file" 
                  disabled={!enableTls}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret-key">Secret Key</Label>
                <Input 
                  id="secret-key" 
                  type="password" 
                  disabled={!enableTls}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="storage-path">Storage Directory Path</Label>
              <Input 
                id="storage-path" 
                value={storagePath} 
                onChange={(e) => setStoragePath(e.target.value)} 
                placeholder="/path/to/{server-files}"
                required
              />
              <CardDescription>
                This path needs to exist on the machine running Docker prior to creating a game server.
              </CardDescription>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button>Save Settings</Button>
        </div>
      </main>
    </div>
  )
}

