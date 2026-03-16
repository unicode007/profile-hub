import { HotelManager } from "@/components/hotel/HotelManager";
import { AuthProvider } from "@/contexts/AuthContext";

const Index = () => {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-muted/30">
        <HotelManager />
      </main>
    </AuthProvider>
  );
};

export default Index;
