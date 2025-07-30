import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Clock, Users, Star, Award } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface CashBillHistoryItem {
  id: string;
  billNumber: string;
  customerName: string;
  total: number;
  date: string;
}

interface CashBillInsightsProps {
  historyItems: CashBillHistoryItem[];
  monthlySummary: { [key: string]: number };
}

const CashBillInsights = ({ historyItems, monthlySummary }: CashBillInsightsProps) => {
  // Get unique customers and their transaction counts
  const customerStats = historyItems.reduce((acc, item) => {
    acc[item.customerName] = (acc[item.customerName] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const topCustomers = Object.entries(customerStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Weekly performance
  const currentWeekStart = startOfWeek(new Date());
  const currentWeekEnd = endOfWeek(new Date());
  
  const thisWeekBills = historyItems.filter(item => 
    isWithinInterval(new Date(item.date), { start: currentWeekStart, end: currentWeekEnd })
  );

  const thisWeekRevenue = thisWeekBills.reduce((sum, item) => sum + item.total, 0);

  // Peak hours analysis
  const hourlyStats = historyItems.reduce((acc, item) => {
    const hour = new Date(item.date).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const peakHour = Object.entries(hourlyStats)
    .sort(([, a], [, b]) => b - a)[0];

  // Revenue goals (example: monthly target)
  const currentMonthRevenue = monthlySummary[format(new Date(), 'yyyy-MM')] || 0;
  const monthlyTarget = 10000; // Example target
  const goalProgress = (currentMonthRevenue / monthlyTarget) * 100;

  // Best performing month
  const bestMonth = Object.entries(monthlySummary)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Insights */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-info/5 to-info/10 border-b pb-4">
          <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Monthly Goal Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Revenue Goal</span>
              <Badge variant={goalProgress >= 100 ? "default" : "secondary"} className="text-xs">
                {goalProgress.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={Math.min(goalProgress, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>RM {currentMonthRevenue.toFixed(2)}</span>
              <span>RM {monthlyTarget.toFixed(2)}</span>
            </div>
          </div>

          {/* This Week Summary */}
          <div className="bg-gradient-to-r from-success/5 to-success/10 rounded-lg p-4 border border-success/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                This Week
              </span>
              <Badge variant="outline" className="text-xs">
                {thisWeekBills.length} bills
              </Badge>
            </div>
            <div className="text-2xl font-bold text-success">RM {thisWeekRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Avg: RM {thisWeekBills.length > 0 ? (thisWeekRevenue / thisWeekBills.length).toFixed(2) : '0.00'} per bill
            </div>
          </div>

          {/* Peak Hour */}
          {peakHour && (
            <div className="bg-gradient-to-r from-warning/5 to-warning/10 rounded-lg p-4 border border-warning/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Peak Business Hour</span>
                <Badge variant="outline" className="text-xs">
                  {peakHour[1]} bills
                </Badge>
              </div>
              <div className="text-xl font-bold text-warning">
                {String(peakHour[0]).padStart(2, '0')}:00 - {String(Number(peakHour[0]) + 1).padStart(2, '0')}:00
              </div>
              <div className="text-xs text-muted-foreground">Most active time period</div>
            </div>
          )}

          {/* Best Month */}
          {bestMonth && (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Best Month
                </span>
                <Badge variant="default" className="text-xs">
                  Record
                </Badge>
              </div>
              <div className="text-xl font-bold text-primary">
                {format(new Date(`${bestMonth[0]}-01`), 'MMMM yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">
                RM {bestMonth[1].toFixed(2)} revenue
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Analytics */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10 border-b pb-4">
          <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {topCustomers.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{Object.keys(customerStats).length}</div>
                  <div className="text-xs text-muted-foreground">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {Math.max(...Object.values(customerStats))}
                  </div>
                  <div className="text-xs text-muted-foreground">Max Visits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">
                    {(Object.values(customerStats).reduce((a, b) => a + b, 0) / Object.keys(customerStats).length).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Visits</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Top Customers
                </h4>
                <div className="space-y-3">
                  {topCustomers.map(([customer, count], index) => {
                    const percentage = (count / historyItems.length) * 100;
                    const customerRevenue = historyItems
                      .filter(item => item.customerName === customer)
                      .reduce((sum, item) => sum + item.total, 0);
                    
                    return (
                      <div key={customer} className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg p-3 border border-muted">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs w-6 h-6 rounded-full p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="font-medium text-sm">{customer}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">RM {customerRevenue.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{count} bills</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground min-w-12">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No customer data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashBillInsights;