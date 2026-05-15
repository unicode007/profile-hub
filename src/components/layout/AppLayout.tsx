import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function pageTitleFromPath(pathname: string) {
  const seg = pathname.replace(/^\/app\//, "").replace(/^\//, "");
  if (!seg) return "Discover";
  return seg
    .split("/")[0]
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("Demo User");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        const meta = (data.user.user_metadata as any) || {};
        setName(meta.full_name || (data.user.email?.split("@")[0] ?? "User"));
      }
    });
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/20">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur border-b flex items-center gap-3 px-3 md:px-4">
            <SidebarTrigger />
            <div className="hidden md:block font-semibold">{pageTitleFromPath(pathname)}</div>
            <div className="flex-1 max-w-md hidden lg:flex items-center relative">
              <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
              <Input placeholder="Search bookings, rooms, guests…" className="pl-9 h-9" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="icon" variant="ghost" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left leading-tight">
                      <div className="text-xs font-medium truncate max-w-[140px]">{name}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{email || "guest"}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => (window.location.href = "/signup")}>
                    Workspace setup
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/signup";
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}