import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Shield, Calendar, Sparkles } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  avatarUrl?: string;
  experienceYears?: number;
}

const ProfileHeader = ({
  name,
  username,
  email,
  role,
  isVerified,
  createdAt,
  avatarUrl,
  experienceYears = 0,
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
    <div className="profile-header animate-slide-up">
      {/* Decorative floating shapes */}
      <div className="floating-shape w-32 h-32 bg-white top-10 left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="floating-shape w-24 h-24 bg-white top-20 right-[20%]" style={{ animationDelay: '2s' }} />
      <div className="floating-shape w-16 h-16 bg-white bottom-20 left-[30%]" style={{ animationDelay: '4s' }} />
      
      <div className="profile-header-bg" />
      <div className="profile-header-content">
        <div className="relative">
          <Avatar className="profile-avatar">
            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
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
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <h1 className="profile-name">{name}</h1>
            <Badge variant={getRoleBadgeVariant(role) as any} className="profile-role-badge">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              {role}
            </Badge>
          </div>
          <p className="profile-username">@{username}</p>
          <p className="profile-email">{email}</p>
          
          <div className="profile-meta">
            <div className="profile-meta-item">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            {isVerified && (
              <div className="profile-meta-item">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Verified</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">{experienceYears}</div>
              <div className="profile-stat-label">Years Exp</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">4.9</div>
              <div className="profile-stat-label">Rating</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">128</div>
              <div className="profile-stat-label">Trips</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
