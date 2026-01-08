import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Shield, Calendar } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  avatarUrl?: string;
}

const ProfileHeader = ({
  name,
  username,
  email,
  role,
  isVerified,
  createdAt,
  avatarUrl,
}: ProfileHeaderProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "admin";
      case "master":
        return "master";
      default:
        return "user";
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-header-bg" />
      <div className="profile-header-content">
        <div className="relative">
          <Avatar className="profile-avatar">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="profile-avatar-fallback">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isVerified && (
            <div className="profile-verified-badge">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="profile-header-info">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="profile-name">{name}</h1>
            <Badge variant={getRoleBadgeVariant(role) as any} className="profile-role-badge">
              <Shield className="h-3 w-3 mr-1" />
              {role}
            </Badge>
          </div>
          <p className="profile-username">@{username}</p>
          <p className="profile-email">{email}</p>
          <div className="profile-meta">
            <Calendar className="h-4 w-4" />
            <span>Member since {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
