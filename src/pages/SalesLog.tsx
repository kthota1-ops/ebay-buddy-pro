import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SaleRecord {
  id: string;
  sold_at: string;
  sale_price: number;
  quantity_sold: number;
  platform: string;
  transaction_id: string | null;
  inventory: {
    name: string;
  };
}

const SalesLog = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/");
      return;
    }

    fetchSales();
  };

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales_log")
        .select(`
          *,
          inventory:inventory_id (name)
        `)
        .order("sold_at", { ascending: false });

      if (error) throw error;

      setSales(data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.sale_price * sale.quantity_sold), 0);
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity_sold, 0);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Sales Log</h1>
              <p className="text-muted-foreground">Track your sales history</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                  <CardDescription>All-time sales revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Items Sold</CardTitle>
                  <CardDescription>Total quantity sold</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{totalItemsSold}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Complete history of your sales</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading sales...
                  </div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No sales recorded yet
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Transaction ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              {format(new Date(sale.sold_at), "MMM d, yyyy HH:mm")}
                            </TableCell>
                            <TableCell className="font-medium">
                              {sale.inventory?.name || "Unknown Item"}
                            </TableCell>
                            <TableCell>{sale.quantity_sold}</TableCell>
                            <TableCell>${sale.sale_price.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">
                              ${(sale.sale_price * sale.quantity_sold).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{sale.platform}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {sale.transaction_id || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SalesLog;
