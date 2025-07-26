import { Eye, MoreVertical, Video, Mic, MessageSquare, Star, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FeedbackItem {
  id: number;
  customerEmail?: string;
  type: string;
  rating: number;
  message?: string;
  submittedAt: string;
  status: string;
  store: {
    name: string;
  };
}

interface FeedbackTableProps {
  feedback: FeedbackItem[];
  loading?: boolean;
}

export default function FeedbackTable({ feedback, loading = false }: FeedbackTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 mr-1 text-success" />;
      case "audio":
        return <Mic className="w-4 h-4 mr-1 text-secondary" />;
      case "text":
        return <MessageSquare className="w-4 h-4 mr-1 text-avatar-accent" />;
      default:
        return <MessageSquare className="w-4 h-4 mr-1" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-success/10 text-success";
      case "audio":
        return "bg-secondary/10 text-secondary";
      case "text":
        return "bg-avatar-accent/10 text-avatar-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-success/10 text-success";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "fill-current" : ""}`}
          />
        ))}
      </div>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-border rounded w-32 animate-pulse"></div>
            <div className="flex space-x-3">
              <div className="h-8 bg-border rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-border rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-border rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-muted rounded-xl animate-pulse">
                <div className="w-10 h-10 bg-border rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-border rounded w-32 mb-2"></div>
                  <div className="h-3 bg-border rounded w-24"></div>
                </div>
                <div className="w-16 h-6 bg-border rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground font-poppins">Recent Feedback</h3>
          <div className="flex items-center space-x-3">
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
            <Button className="btn-secondary rounded-xl text-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h4 className="text-lg font-semibold mb-2 font-poppins">No Feedback Yet</h4>
          <p className="text-muted-foreground">
            When customers start leaving feedback, it will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {feedback.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">
                          {item.customerEmail ? item.customerEmail.charAt(0).toUpperCase() : "A"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {item.customerEmail || "Anonymous"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{item.store.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-foreground">{item.rating.toFixed(1)}</span>
                      {renderStars(item.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatTimeAgo(item.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {feedback.length > 0 && (
        <div className="px-6 py-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing 1-{feedback.length} of {feedback.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm" className="btn-primary">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
