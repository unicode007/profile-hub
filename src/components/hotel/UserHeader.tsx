import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { User, LogOut, Calendar, Settings, HelpCircle } from "lucide-react";

interface UserHeaderProps {
  onNavigateToBookings?: () => void;
}

export const UserHeader = ({ onNavigateToBookings }: UserHeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const handleOpenLogin = () => {
    setAuthTab("login");
    setShowAuthModal(true);
  };

  const handleOpenSignup = () => {
    setAuthTab("signup");
    setShowAuthModal(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleOpenLogin}>
            Sign In
          </Button>
          <Button onClick={handleOpenSignup}>Sign Up</Button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authTab}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onNavigateToBookings} className="cursor-pointer">
          <Calendar className="mr-2 h-4 w-4" />
          <span>My Bookings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
