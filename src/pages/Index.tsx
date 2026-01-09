import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePage from "@/components/profile/ProfilePage";
import EmployeeProfile from "@/components/profile/EmployeeProfile";

const Index = () => {
  const [profileType, setProfileType] = useState("user");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Profile Type Selector */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Tabs value={profileType} onValueChange={setProfileType}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="user">User Profile</TabsTrigger>
              <TabsTrigger value="employee">Employee Profile</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Profile Content */}
      {profileType === "user" ? <ProfilePage /> : <EmployeeProfile />}
    </div>
  );
};

export default Index;
