import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LogOut, Target, Building2, TrendingUp, Users, Calendar, Award } from "lucide-react";
import { toast } from "sonner";

interface ProfileCardProps {
  className?: string;
  hideKPI?: boolean;
}

export const ProfileCard = ({ className = "", hideKPI = false }: ProfileCardProps) => {
  const [userProfile] = useState({
    name: "Ahmad Zaki",
    initials: "AZ",
    avatar: "/lovable-uploads/a01d5434-d3b5-4f60-ad0d-c47b5a2b2294.png",
    branch: "Kuala Lumpur Central",
    department: "Sales & Marketing",
    kpiTarget: "RM 25,000",
    kpiCurrent: "RM 18,500",
    kpiProgress: 74,
    rank: "Senior Agent",
    teamSize: 12,
    lastLogin: "Today, 9:24 AM",
    monthlyTarget: 85,
    weeklyProgress: 68
  });

  const handleLogout = () => {
    toast.success("Logged out successfully");
    // Add actual logout logic here
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-success";
    if (progress >= 70) return "text-warning";
    return "text-destructive";
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return "bg-success";
    if (progress >= 70) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className={`bg-card border border-border shadow-sm ${className}`}>
      <CardContent className="p-2 flex items-center">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6 border border-primary/20">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {userProfile.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{userProfile.name}</span>
                <Badge variant="outline" className="text-xs px-1.5 py-0 text-primary border-primary/30">
                  {userProfile.rank}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{userProfile.branch}</span>
                <span>•</span>
                <span>{userProfile.lastLogin}</span>
              </div>
            </div>
          </div>
          
          {/* KPI Progress Section - Only show if hideKPI is false */}
          {!hideKPI && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Monthly KPI</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={userProfile.kpiProgress} 
                  className="h-1.5 w-24"
                />
                <span className={`text-xs font-bold ${getProgressColor(userProfile.kpiProgress)}`}>
                  {userProfile.kpiProgress}%
                </span>
              </div>
            </div>
          )}
          
          {/* Performance Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="font-medium text-success">{userProfile.weeklyProgress}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-warning" />
              <span className="font-medium text-warning">{userProfile.monthlyTarget}%</span>
            </div>
          </div>
          
          {/* Logout Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:border-destructive/50 flex-shrink-0"
            title="Logout"
          >
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};