import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link2, Trash2, PlusCircle } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface EbayAccount {
  id: string;
  account_name: string;
  ebay_user_id: string | null;
  is_active: boolean;
  connected_at: string;
}

const Settings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ebayAccounts, setEbayAccounts] = useState<EbayAccount[]>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/");
      return;
    }

    fetchProfile();
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || "");
      setAvatarUrl(data.avatar_url || "");
      
      fetchEbayAccounts();
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEbayAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ebay_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("connected_at", { ascending: false });

      if (error) throw error;
      setEbayAccounts(data || []);
    } catch (error) {
      console.error("Error fetching eBay accounts:", error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEbayAccount = async () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an account name",
        variant: "destructive",
      });
      return;
    }

    setIsAddingAccount(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("ebay_accounts")
        .insert({
          user_id: user.id,
          account_name: newAccountName,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "eBay account added successfully",
      });

      setNewAccountName("");
      fetchEbayAccounts();
    } catch (error) {
      console.error("Error adding eBay account:", error);
      toast({
        title: "Error",
        description: "Failed to add eBay account",
        variant: "destructive",
      });
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from("ebay_accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "eBay account removed successfully",
      });

      fetchEbayAccounts();
    } catch (error) {
      console.error("Error deleting eBay account:", error);
      toast({
        title: "Error",
        description: "Failed to remove eBay account",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading settings...
              </div>
            ) : (
              <div className="max-w-2xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="text-lg">
                          {fullName?.charAt(0)?.toUpperCase() || profile?.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                          id="avatar"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="shadow-aqua"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>eBay Accounts</CardTitle>
                    <CardDescription>Connect and manage multiple eBay accounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ebayAccounts.length > 0 && (
                      <div className="space-y-3">
                        {ebayAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Link2 className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{account.account_name}</p>
                                {account.ebay_user_id && (
                                  <p className="text-sm text-muted-foreground">
                                    ID: {account.ebay_user_id}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={account.is_active ? "default" : "secondary"}>
                                {account.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAccount(account.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Account name (e.g., My Store)"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddEbayAccount()}
                      />
                      <Button
                        onClick={handleAddEbayAccount}
                        disabled={isAddingAccount}
                        className="shadow-aqua"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Note: OAuth integration coming soon. For now, you can add account names to organize your inventory.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your account is connected with Google Sign-In
                    </p>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        navigate("/");
                      }}
                    >
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
