import { User, Phone, MapPin, Briefcase, Globe } from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import ProfileSection from "./ProfileSection";
import ProfileField from "./ProfileField";
import LanguageBadges from "./LanguageBadges";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

// Demo data matching your schema
const profileData = {
  // Auth fields
  id: "507f1f77bcf86cd799439011",
  name: "Rajesh Kumar",
  email: "rajesh.kumar@example.com",
  mobile: "+91 98765 43210",
  username: "rajeshk",
  role: "USER",
  is_verified: true,
  created_at: "2024-03-15T10:30:00Z",
  updated_at: "2024-12-28T14:45:00Z",
  created_by: null,
  created_role: null,

  // Profile fields
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
  },
};

const ProfilePage = () => {
  const { profile } = profileData;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header Section */}
        <ProfileHeader
          name={profileData.name}
          username={profileData.username}
          email={profileData.email}
          role={profileData.role}
          isVerified={profileData.is_verified}
          createdAt={profileData.created_at}
        />

        {/* Edit Button */}
        <div className="flex justify-end mb-6">
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Sections Grid */}
        <div className="profile-grid">
          {/* Personal Information */}
          <ProfileSection title="Personal Information" icon={User}>
            <div className="profile-fields-grid">
              <ProfileField label="Full Name" value={profileData.name} />
              <ProfileField label="Father's Name" value={profile.father_name} />
              <ProfileField label="Date of Birth" value={formatDate(profile.dob)} />
              <ProfileField label="Gender" value={profile.gender} />
              <ProfileField label="Username" value={profileData.username} />
              <ProfileField label="Experience" value={profile.experience_years ? `${profile.experience_years} years` : null} />
            </div>
          </ProfileSection>

          {/* Contact Information */}
          <ProfileSection title="Contact Details" icon={Phone}>
            <div className="profile-fields-grid">
              <ProfileField label="Email Address" value={profileData.email} />
              <ProfileField label="Mobile Number" value={profileData.mobile} />
              <ProfileField label="Alternate Mobile" value={profile.alternate_mobile} />
            </div>
          </ProfileSection>

          {/* Current Address */}
          <ProfileSection title="Current Address" icon={MapPin}>
            <div className="profile-fields-grid">
              <ProfileField label="Address" value={profile.current_address} />
              <ProfileField label="City" value={profile.city} />
              <ProfileField label="State" value={profile.state} />
              <ProfileField label="Country" value={profile.country} />
              <ProfileField label="Pincode" value={profile.pincode} />
            </div>
          </ProfileSection>

          {/* Permanent Address */}
          <ProfileSection title="Permanent Address" icon={MapPin}>
            <div className="profile-fields-grid">
              <ProfileField label="Address" value={profile.permanent_address} />
            </div>
          </ProfileSection>

          {/* Languages */}
          <ProfileSection title="Languages" icon={Globe}>
            <LanguageBadges languages={profile.language} />
          </ProfileSection>

          {/* Account Information */}
          <ProfileSection title="Account Details" icon={Briefcase}>
            <div className="profile-fields-grid">
              <ProfileField label="Account ID" value={profileData.id} />
              <ProfileField label="Created At" value={formatDate(profileData.created_at)} />
              <ProfileField label="Last Updated" value={formatDate(profileData.updated_at)} />
              <ProfileField label="Created By" value={profileData.created_by} />
              <ProfileField label="Created Role" value={profileData.created_role} />
            </div>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
