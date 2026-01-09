import { useState } from "react";
import { Camera, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Demo data matching your schema
const initialProfileData = {
  id: "507f1f77bcf86cd799439011",
  name: "Rajesh Kumar",
  email: "rajesh.kumar@example.com",
  mobile: "+91 98765 43210",
  username: "rajeshk",
  role: "USER",
  is_verified: true,
  created_at: "2024-03-15T10:30:00Z",
  updated_at: "2024-12-28T14:45:00Z",

  profile: {
    father_name: "Suresh Kumar",
    alternate_mobile: "+91 98765 43211",
    dob: "1990-05-15",
    gender: "Male",
    experience_years: 8,
    current_address: "123, Sector 15, Gurgaon",
    permanent_address: "456, Old City Road, Jaipur",
    city: "Gurgaon",
    state: "Haryana",
    country: "India",
    pincode: "122001",
    language: ["Hindi", "English", "Punjabi"],
    bio: "Experienced professional driver with 8+ years in the travel and tourism industry. Specialized in long-distance travel and corporate transport services.",
    nickname: "Raj",
    display_name: "Rajesh",
    whatsapp: "@rajeshk",
    telegram: "@rajesh_driver",
    website: "rajesh-kumar.travel.io",
  },
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [profileData, setProfileData] = useState(initialProfileData);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">👤</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Users</h1>
          </div>

          <Tabs defaultValue="all" className="hidden sm:block">
            <TabsList className="bg-muted">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className="bg-primary hover:bg-primary/90">
            <span className="mr-2">+</span>
            Add New User
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Left Sidebar - Account Management */}
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Account Management
              </h2>

              {/* Avatar Section */}
              <div className="relative w-40 h-40 mx-auto mb-4">
                <Avatar className="w-full h-full rounded-lg">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                    alt={profileData.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-semibold bg-muted rounded-lg">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>

            {/* Password Section */}
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="text-sm font-medium text-foreground">
                  Old Password
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="pr-10 bg-background border-border"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 bg-background border-border"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Right Content - Profile Form */}
          <div className="space-y-8">
            {/* Profile Information */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-4">
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profileData.name.split(" ")[0]}
                    onChange={(e) =>
                      handleInputChange(
                        "name",
                        e.target.value + " " + profileData.name.split(" ").slice(1).join(" ")
                      )
                    }
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-medium text-foreground">
                    Nickname
                  </Label>
                  <Input
                    id="nickname"
                    value={profileData.profile.nickname}
                    onChange={(e) => handleInputChange("profile.nickname", e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-foreground">
                    Role
                  </Label>
                  <Select
                    value={profileData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Subscriber</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MASTER">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profileData.name.split(" ").slice(1).join(" ")}
                    onChange={(e) =>
                      handleInputChange("name", profileData.name.split(" ")[0] + " " + e.target.value)
                    }
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
                    Display Name Publicly as
                  </Label>
                  <Input
                    id="displayName"
                    value={profileData.profile.display_name}
                    onChange={(e) => handleInputChange("profile.display_name", e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-4">Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email (required)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-foreground">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={profileData.profile.whatsapp}
                    onChange={(e) => handleInputChange("profile.whatsapp", e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-foreground">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={profileData.profile.website}
                    onChange={(e) => handleInputChange("profile.website", e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram" className="text-sm font-medium text-foreground">
                    Telegram
                  </Label>
                  <Input
                    id="telegram"
                    value={profileData.profile.telegram}
                    onChange={(e) => handleInputChange("profile.telegram", e.target.value)}
                    disabled={!isEditing}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </section>

            {/* About the User */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-4">About the User</h3>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                  Biographical Info
                </Label>
                <Textarea
                  id="bio"
                  value={profileData.profile.bio}
                  onChange={(e) => handleInputChange("profile.bio", e.target.value)}
                  disabled={!isEditing}
                  className="bg-background border-border min-h-[120px] resize-none"
                  placeholder="Write a short bio about the user..."
                />
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "default" : "outline"}
                className={
                  isEditing
                    ? "bg-primary hover:bg-primary/90"
                    : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setProfileData(initialProfileData);
                    setIsEditing(false);
                  }}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
