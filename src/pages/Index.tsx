import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, BarChart3, ShoppingBag, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Inventory Manager</span>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="gradient-hero py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Manage Your Inventory with Ease
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A powerful, beautiful inventory management system designed for modern businesses. 
              Track stock, sync with eBay, and analyze your sales—all in one place.
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-aqua text-lg px-8">
              Start Managing Inventory
            </Button>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Inventory Management</h3>
                <p className="text-muted-foreground">
                  Add, edit, and organize your products with detailed information, 
                  images, and categories.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">eBay Integration</h3>
                <p className="text-muted-foreground">
                  Connect your eBay account and sync listings automatically. 
                  Track sales in real-time.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Analytics & Reports</h3>
                <p className="text-muted-foreground">
                  Get insights into your inventory value, sales trends, and 
                  low stock alerts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create your free account and start managing your inventory like a pro.
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-aqua text-lg px-8">
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Inventory Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
