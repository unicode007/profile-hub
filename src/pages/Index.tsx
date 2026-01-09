import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePage from "@/components/profile/ProfilePage";
import EmployeeProfile from "@/components/profile/EmployeeProfile";
import { HotelManager } from "@/components/hotel/HotelManager";

const Index = () => {
  const [activeView, setActiveView] = useState("hotels");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* View Selector */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="hotels">Hotel Management</TabsTrigger>
              <TabsTrigger value="user">User Profile</TabsTrigger>
              <TabsTrigger value="employee">Employee Profile</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {activeView === "hotels" && <HotelManager />}
      {activeView === "user" && <ProfilePage />}
      {activeView === "employee" && <EmployeeProfile />}
    </div>
  );
};

export default Index;
