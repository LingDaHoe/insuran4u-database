import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { format } from "date-fns";

interface CashBillHistoryItem {
  id: string;
  billNumber: string;
  customerName: string;
  total: number;
  date: string;
}

interface CashBillMetricsProps {
  historyItems: CashBillHistoryItem[];
  monthlySummary: { [key: string]: number };
}

const CashBillMetrics = ({ historyItems, monthlySummary }: CashBillMetricsProps) => {
  const getCurrentMonth = () => format(new Date(), 'yyyy-MM');
  const getPreviousMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return format(date, 'yyyy-MM');
  };

  const currentMonthTotal = monthlySummary[getCurrentMonth()] || 0;
  const previousMonthTotal = monthlySummary[getPreviousMonth()] || 0;
  const monthlyGrowth = previousMonthTotal > 0 
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
    : 0;

  const recentEntries = historyItems
    .filter(item => {
      const entryDate = new Date(item.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return entryDate >= thirtyDaysAgo;
    });

  const averagePerDay = recentEntries.length > 0 ? recentEntries.length / 30 : 0;
  const totalRevenue = historyItems.reduce((sum, item) => sum + item.total, 0);
  const averageTransactionValue = historyItems.length > 0 ? totalRevenue / historyItems.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Monthly Growth */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
          {monthlyGrowth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${monthlyGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
            {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            vs previous month
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={monthlyGrowth >= 0 ? "default" : "destructive"} className="text-xs">
              RM {Math.abs(currentMonthTotal - previousMonthTotal).toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Frequency */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity Rate</CardTitle>
          <Activity className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-info">
            {averagePerDay.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            bills per day (30d avg)
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {recentEntries.length} recent bills
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Average Transaction Value */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          <Target className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            RM {averageTransactionValue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            per bill overall
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {historyItems.length} total bills
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicator */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {Object.keys(monthlySummary).length}
          </div>
          <p className="text-xs text-muted-foreground">
            active months
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs">
              RM {(totalRevenue / Object.keys(monthlySummary).length || 0).toFixed(0)}/mo avg
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashBillMetrics;