import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Copy,
  Mail,
  Link2,
  QrCode,
  Share2,
  Calendar,
  Eye,
  Lock,
  Clock,
  Users,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { format } from "date-fns";

interface ShareCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName?: string;
  calendarType: "room" | "date" | "booking";
  currentMonth: Date;
  onExport?: (format: "csv" | "pdf" | "excel" | "print") => void;
}

export const ShareCalendarModal = ({
  isOpen,
  onClose,
  hotelName,
  calendarType,
  currentMonth,
  onExport,
}: ShareCalendarModalProps) => {
  const [shareSettings, setShareSettings] = useState({
    includeGuestNames: true,
    includeRevenue: false,
    includeContactInfo: false,
    expiresIn: "7days",
    requirePassword: false,
    password: "",
  });
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState("");

  const shareLink = `https://hotel.app/calendar/share/${calendarType}/${btoa(
    JSON.stringify({
      hotel: hotelName,
      month: format(currentMonth, "yyyy-MM"),
      type: calendarType,
    })
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  const handleSendEmail = () => {
    if (!emails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }
    toast.success(`Calendar shared with ${emails.split(",").length} recipient(s)`);
    setEmails("");
    setMessage("");
  };

  const handleExport = (format: "csv" | "pdf" | "excel" | "print") => {
    onExport?.(format);
    toast.success(`Exporting calendar as ${format.toUpperCase()}...`);
  };

  const generateQRCode = () => {
    // In a real app, this would generate an actual QR code
    toast.success("QR Code generated! (Demo mode)");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share & Export Calendar
          </DialogTitle>
          <DialogDescription>
            Share your {calendarType} calendar for{" "}
            {hotelName || "all hotels"} - {format(currentMonth, "MMMM yyyy")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share" className="gap-2">
              <Link2 className="h-4 w-4" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Share Link</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={shareLink} readOnly className="flex-1 text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={generateQRCode}
                >
                  <QrCode className="h-4 w-4" />
                  Generate QR Code
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => {
                    window.open(
                      `https://calendar.google.com/calendar/r/settings/addbyurl`,
                      "_blank"
                    );
                    toast.info("Add the share link to your Google Calendar");
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Sync to Calendar
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Privacy Settings
                </h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Guest Names</Label>
                    <p className="text-xs text-muted-foreground">
                      Show guest names in shared view
                    </p>
                  </div>
                  <Switch
                    checked={shareSettings.includeGuestNames}
                    onCheckedChange={(checked) =>
                      setShareSettings({ ...shareSettings, includeGuestNames: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Revenue Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Show financial information
                    </p>
                  </div>
                  <Switch
                    checked={shareSettings.includeRevenue}
                    onCheckedChange={(checked) =>
                      setShareSettings({ ...shareSettings, includeRevenue: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Password</Label>
                    <p className="text-xs text-muted-foreground">
                      Protect with a password
                    </p>
                  </div>
                  <Switch
                    checked={shareSettings.requirePassword}
                    onCheckedChange={(checked) =>
                      setShareSettings({ ...shareSettings, requirePassword: checked })
                    }
                  />
                </div>

                {shareSettings.requirePassword && (
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={shareSettings.password}
                    onChange={(e) =>
                      setShareSettings({ ...shareSettings, password: e.target.value })
                    }
                  />
                )}

                <div className="space-y-2">
                  <Label>Link Expires</Label>
                  <div className="flex gap-2">
                    {["24hours", "7days", "30days", "never"].map((option) => (
                      <Badge
                        key={option}
                        variant={shareSettings.expiresIn === option ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          setShareSettings({ ...shareSettings, expiresIn: option })
                        }
                      >
                        {option === "24hours" && "24 Hours"}
                        {option === "7days" && "7 Days"}
                        {option === "30days" && "30 Days"}
                        {option === "never" && "Never"}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Recipients</Label>
                <Input
                  placeholder="Enter email addresses (comma separated)"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personal message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Email Preview</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>
                    <strong>Subject:</strong> {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar -{" "}
                    {hotelName || "All Hotels"} ({format(currentMonth, "MMMM yyyy")})
                  </p>
                  <p className="line-clamp-2">
                    <strong>Preview:</strong> You've been invited to view the availability
                    calendar. {message && `"${message}"`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>Recipients will have view-only access</span>
              </div>

              <Button onClick={handleSendEmail} className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleExport("csv")}
              >
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <span>Export as CSV</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleExport("excel")}
              >
                <FileSpreadsheet className="h-8 w-8 text-green-700" />
                <span>Export as Excel</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleExport("pdf")}
              >
                <FileText className="h-8 w-8 text-red-600" />
                <span>Export as PDF</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleExport("print")}
              >
                <Printer className="h-8 w-8 text-blue-600" />
                <span>Print Calendar</span>
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Export Options</h4>
              <div className="flex items-center justify-between">
                <Label>Include all room types</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Include booking details</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Include revenue summary</Label>
                <Switch />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
