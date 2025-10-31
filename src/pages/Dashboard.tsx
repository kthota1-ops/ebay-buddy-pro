import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AnalyticsCards } from "@/components/AnalyticsCards";
import { InventoryTable } from "@/components/InventoryTable";
import { AddItemDialog } from "@/components/AddItemDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Search } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  price: number;
  category: string | null;
  description: string | null;
  image_url: string | null;
  ebay_listing_url: string | null;
}

const Dashboard = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/");
      return;
    }

    fetchInventory();
  };

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);
      setFilteredItems(data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockCount = items.filter((item) => item.quantity < 5).length;

  const analyticsData = {
    totalItems: items.length,
    totalValue,
    itemsSold: 0, // This will be populated from sales_log in future
    lowStock: lowStockCount,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Inventory</h1>
                <p className="text-muted-foreground">Manage your products and stock</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="shadow-aqua">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <AnalyticsCards data={analyticsData} />

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading inventory...
                </div>
              ) : (
                <InventoryTable
                  items={filteredItems}
                  onEdit={handleEdit}
                  onRefresh={fetchInventory}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={fetchInventory}
        editItem={editItem}
      />
    </SidebarProvider>
  );
};

export default Dashboard;
