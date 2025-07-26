import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Plus, Settings, BarChart3 } from "lucide-react";
import StatsCard from "@/components/ui/stats-card";
import FeedbackTable from "@/components/ui/feedback-table";
import QRGenerator from "@/components/ui/qr-generator";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/feedback/stats"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Fetch user's stores
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ["/api/stores"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Fetch recent feedback
  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ["/api/feedback"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary font-poppins">FeedbackFlow</h1>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a href="#" className="text-primary border-b-2 border-primary px-1 pb-4 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground px-1 pb-4 text-sm font-medium transition-colors">
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Analytics
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground px-1 pb-4 text-sm font-medium transition-colors">
                  <Settings className="w-4 h-4 inline mr-1" />
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="btn-primary rounded-xl text-sm">
                <Plus className="w-4 h-4 mr-2" />
                New Store
              </Button>
              <div className="relative">
                <img 
                  className="h-10 w-10 rounded-xl object-cover" 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                  alt="Profile"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="rounded-xl"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Reviews"
            value={stats?.totalReviews?.toString() || "0"}
            change="+12.5%"
            changeLabel="from last week"
            icon="comment"
            loading={statsLoading}
          />
          <StatsCard
            title="Average Rating"
            value={stats?.averageRating?.toFixed(1) || "0.0"}
            change="+0.3"
            changeLabel="from last week"
            icon="star"
            loading={statsLoading}
          />
          <StatsCard
            title="Video Reviews"
            value={stats?.videoReviews?.toString() || "0"}
            change="+28%"
            changeLabel="engagement rate"
            icon="video"
            loading={statsLoading}
          />
          <StatsCard
            title="Active Stores"
            value={stats?.activeStores?.toString() || "0"}
            change="+2"
            changeLabel="this month"
            icon="qrcode"
            loading={statsLoading}
          />
        </div>

        {/* Stores and QR Codes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Store Management */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground font-poppins">Your Stores</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            </div>
            
            {/* Store List */}
            <div className="space-y-4">
              {storesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-muted rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-border rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-border rounded w-32 mb-2"></div>
                        <div className="h-3 bg-border rounded w-24"></div>
                      </div>
                      <div className="w-16 h-6 bg-border rounded"></div>
                    </div>
                  ))}
                </div>
              ) : stores && stores.length > 0 ? (
                stores.map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center space-x-4">
                      <img 
                        className="w-12 h-12 rounded-lg object-cover" 
                        src={store.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                        alt="Store" 
                      />
                      <div>
                        <p className="font-medium text-foreground">{store.name}</p>
                        <p className="text-sm text-muted-foreground">{store.address || "No address set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        {store.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No stores yet</p>
                  <Button className="btn-primary rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Store
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Generator */}
          <QRGenerator stores={stores || []} />
        </div>

        {/* Recent Feedback */}
        <FeedbackTable feedback={feedback || []} loading={feedbackLoading} />
      </main>
    </div>
  );
}
