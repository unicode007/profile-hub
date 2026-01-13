import { AuthProvider } from "@/contexts/AuthContext";
import { HotelManager } from "@/components/hotel/HotelManager";

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-muted/30">
        <HotelManager />
      </div>
    </AuthProvider>
  );
};

export default Index;
