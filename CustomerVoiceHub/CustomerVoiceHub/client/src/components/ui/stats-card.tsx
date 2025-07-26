import { MessageSquare, Star, Video, QrCode, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeLabel?: string;
  icon: "comment" | "star" | "video" | "qrcode";
  loading?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  loading = false 
}: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "comment":
        return <MessageSquare className="w-5 h-5 text-primary" />;
      case "star":
        return <Star className="w-5 h-5 text-secondary" />;
      case "video":
        return <Video className="w-5 h-5 text-success" />;
      case "qrcode":
        return <QrCode className="w-5 h-5 text-avatar-accent" />;
      default:
        return <MessageSquare className="w-5 h-5 text-primary" />;
    }
  };

  const getIconBgColor = () => {
    switch (icon) {
      case "comment":
        return "bg-primary/10";
      case "star":
        return "bg-secondary/10";
      case "video":
        return "bg-success/10";
      case "qrcode":
        return "bg-avatar-accent/10";
      default:
        return "bg-primary/10";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border animate-pulse">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${getIconBgColor()} rounded-lg flex items-center justify-center`}>
              {getIcon()}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-border rounded w-20 mb-2"></div>
            <div className="h-6 bg-border rounded w-12"></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-4 bg-border rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${getIconBgColor()} rounded-lg flex items-center justify-center`}>
            {getIcon()}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
      {change && changeLabel && (
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-success mr-1" />
            <span className="text-success font-medium">{change}</span>
            <span className="text-muted-foreground ml-1">{changeLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
