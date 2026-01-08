import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProfileSectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

const ProfileSection = ({ title, icon: Icon, children }: ProfileSectionProps) => {
  return (
    <Card className="profile-card">
      <CardHeader className="profile-card-header">
        <CardTitle className="profile-card-title">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="profile-card-content">
        {children}
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
