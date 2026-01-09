import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, Calendar, User, Briefcase, Plus, MoreHorizontal } from "lucide-react";

const employeeData = {
  name: "Nicholas Swatz",
  employeeId: "#ERD246534",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  phone: "(629) 555-0123",
  email: "nicholasswatz@gmail.com",
  address: "390 Market Street, Suite 200",
  cityState: "San Francisco",
  postcode: "94102",
  dateOfBirth: "Sep 26, 1988",
  nationalId: "GER10654",
  title: "Project Manager",
  hireDate: "Jan 05, 2023",
};

const jobInfo = [
  { department: "Creative Associate", division: "Project Management", manager: "Alex Foster", hireDate: "May 13, 2024", location: "Metro DC" },
  { department: "Marketing Team", division: "Leadership", manager: "Jack Danniel", hireDate: "Sep 05, 2024", location: "Bergen, NJ" },
  { department: "Team Lead", division: "Creator", manager: "Alina Skazka", hireDate: "Jun 08, 2023", location: "Miami, FL" },
  { department: "Finance & Accounting", division: "Senior Consultant", manager: "John Miller", hireDate: "Sep 13, 2022", location: "Chicago, IL" },
  { department: "Team Lead", division: "Creator", manager: "Mark Baldwin", hireDate: "Jul 07, 2023", location: "Miami, FL" },
];

const activities = [
  { name: "John Miller", action: "last login on", date: "Jul 13, 2024", time: "05:36 PM", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
  { name: "Merva Sahin", action: "date created on", date: "Sep 08, 2024", time: "03:12 PM", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
  { name: "Tammy Collier", action: "updated on", date: "Aug 15, 2023", time: "05:36 PM", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" },
];

const compensations = [
  { amount: "862.00", currency: "USD", frequency: "per month", effectiveDate: "May 10, 2015" },
  { amount: "1560.00", currency: "USD", frequency: "per quarter", effectiveDate: "Jun 08, 2022" },
  { amount: "378.00", currency: "USD", frequency: "per week", effectiveDate: "Jun 08, 2022" },
];

const EmployeeProfile = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add employee
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 mb-6">
            {["Overview", "Compensation", "Emergency", "Time Off", "Performance", "Files", "Onboarding"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase().replace(" ", "-")}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={employeeData.avatar} alt={employeeData.name} />
                    <AvatarFallback>{employeeData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">{employeeData.name}</h2>
                    <p className="text-sm text-muted-foreground">{employeeData.employeeId}</p>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">About</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{employeeData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{employeeData.email}</span>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Address</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-foreground">{employeeData.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">City state:</span>
                      <span className="text-foreground">{employeeData.cityState}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">Postcode:</span>
                      <span className="text-foreground">{employeeData.postcode}</span>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Employee details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date of birth:</span>
                      <span className="text-foreground">{employeeData.dateOfBirth}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">National ID:</span>
                      <span className="text-foreground">{employeeData.nationalId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Title:</span>
                      <span className="text-foreground">{employeeData.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Hire date:</span>
                      <span className="text-foreground">{employeeData.hireDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Job Information */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">Job information</h3>
                    <Button variant="link" className="text-primary p-0 h-auto">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Info
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Division</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Manager</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Hire Date</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                          <th className="py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobInfo.map((job, index) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="py-3 px-2 text-sm text-foreground">{job.department}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">{job.division}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{job.manager}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">{job.hireDate}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{job.location}</td>
                            <td className="py-3 px-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activity and Compensation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Activity */}
                  <div>
                    <h3 className="font-medium text-foreground mb-4">Activity</h3>
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={activity.avatar} alt={activity.name} />
                            <AvatarFallback>{activity.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium text-foreground">{activity.name}</span>
                              <span className="text-muted-foreground"> {activity.action} </span>
                              <span className="text-foreground">{activity.date}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                      <Button variant="link" className="text-primary p-0 h-auto text-sm">
                        View all
                      </Button>
                    </div>
                  </div>

                  {/* Compensation */}
                  <div>
                    <h3 className="font-medium text-foreground mb-4">Compensation</h3>
                    <div className="space-y-4">
                      {compensations.map((comp, index) => (
                        <div key={index}>
                          <p className="text-sm font-medium text-foreground">
                            {comp.amount} {comp.currency} {comp.frequency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Effective date on {comp.effectiveDate}
                          </p>
                        </div>
                      ))}
                      <Button variant="link" className="text-primary p-0 h-auto text-sm">
                        View all
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs placeholder content */}
          {["compensation", "emergency", "time-off", "performance", "files", "onboarding"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")} content coming soon...
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeProfile;
