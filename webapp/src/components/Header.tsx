'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import AnchorDark from "../assets/anchor-dark.svg";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const pathname = usePathname();

  const activeTab =
    pathname === "/backups"
      ? "backups"
      : pathname === "/settings"
      ? "settings"
      : "servers";

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={AnchorDark} alt="ANCHORLAB" className="h-6 w-6" />
          <span className="font-bold text-xl">HELIX</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Tabs value={activeTab}>
            <TabsList>
              <TabsTrigger value="servers" asChild>
                <Link href="/">Servers</Link>
              </TabsTrigger>
              <TabsTrigger value="backups" asChild>
                <Link href="/backups">Backups</Link>
              </TabsTrigger>
              <TabsTrigger value="settings" asChild>
                <Link href="/settings">Settings</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}