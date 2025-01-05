'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Server } from './Dashboard'

interface CreateServerDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onCreateServer: (newServer: Omit<Server, 'id' | 'players' | 'logs'>) => void
}

export function CreateServerDialog({ isOpen, setIsOpen, onCreateServer }: CreateServerDialogProps) {
  const [name, setName] = useState('')
  const [port, setPort] = useState('')
  const [version, setVersion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateServer({
      name,
      port: parseInt(port),
      version,
      status: 'stopped'
    })
    setIsOpen(false)
    setName('')
    setPort('')
    setVersion('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Minecraft Server</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                Port
              </Label>
              <Input 
                id="port" 
                value={port} 
                onChange={(e) => setPort(e.target.value)} 
                className="col-span-3" 
                type="number" 
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">
                Version
              </Label>
              <Input 
                id="version" 
                value={version} 
                onChange={(e) => setVersion(e.target.value)} 
                className="col-span-3" 
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Server</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

