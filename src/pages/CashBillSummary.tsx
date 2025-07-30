import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, DollarSign, Calendar, TrendingUp, BookOpen, Calculator } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import CashBillMetrics from "@/components/CashBillMetrics";
import CashBillTransactionTable from "@/components/CashBillTransactionTable";
import CashBillInsights from "@/components/CashBillInsights";


interface CashBillHistoryItem {
  id: string;
  billNumber: string;
  customerName: string;
  total: number;
  date: string;
}

const CashBillSummary = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<CashBillHistoryItem[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('cash-bill-history');
    if (savedHistory) {
      try {
        const history: CashBillHistoryItem[] = JSON.parse(savedHistory);
        setHistoryItems(history);
        
        // Calculate monthly summary
        const summary: {[key: string]: number} = {};
        history.forEach(item => {
          const monthKey = format(new Date(item.date), 'yyyy-MM');
          summary[monthKey] = (summary[monthKey] || 0) + item.total;
        });
        setMonthlySummary(summary);
      } catch (error) {
        console.error('Error loading cash bill history:', error);
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteEntry = (entryId: string) => {
    const updatedHistory = historyItems.filter(item => item.id !== entryId);
    localStorage.setItem('cash-bill-history', JSON.stringify(updatedHistory));
    loadHistory();
    toast({
      title: "Entry deleted",
      description: "The cash bill entry has been removed from history.",
    });
  };

  const getCurrentMonthTotal = () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return monthlySummary[currentMonth] || 0;
  };

  const getCurrentMonthEntries = () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return historyItems.filter(item => 
      format(new Date(item.date), 'yyyy-MM') === currentMonth
    );
  };

  const totalBills = historyItems.length;
  const totalRevenue = historyItems.reduce((sum, item) => sum + item.total, 0);
  const currentMonthEntries = getCurrentMonthEntries();
  const currentMonthTotal = getCurrentMonthTotal();

  // Prepare chart data
  const chartData = Object.entries(monthlySummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month: format(new Date(`${month}-01`), 'MMM yyyy'),
      revenue: total,
      bills: historyItems.filter(item => 
        format(new Date(item.date), 'yyyy-MM') === month
      ).length
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-100 dark:from-slate-950 dark:via-background dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Back Icon Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-10 w-10 p-0 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {/* Cash Bill Summary Badge */}
              <div className="bg-card border border-border rounded-lg h-10 flex items-center px-4">
                <span className="text-sm font-semibold">Cash Bill Summary</span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 ml-3">
                  {totalBills} Bills
                </Badge>
              </div>
            </div>
            
            {/* Header Info Container */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-success/5 to-success/10 border border-success/20 rounded-lg h-10 flex items-center px-4 gap-3">
                <Calculator className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Total: RM {totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalBills}</div>
                <p className="text-xs text-muted-foreground">All time generated</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">RM {totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-info/5 to-info/10 border-info/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">RM {currentMonthTotal.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{format(new Date(), 'MMM yyyy')}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/5 to-purple-500/10 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average per Bill</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">
                  RM {totalBills > 0 ? (totalRevenue / totalBills).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Overall average</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Professional Analytics Section */}
        <div className="space-y-8">
          {/* Advanced Metrics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-6 text-foreground">Business Analytics</h2>
            <CashBillMetrics historyItems={historyItems} monthlySummary={monthlySummary} />
          </div>

          {/* Sales Chart */}
          {chartData.length > 0 && (
            <Card className="border-2 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-info/5 to-info/10 border-b pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium text-foreground">
                    Revenue Trend Analysis
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-mono">
                    {chartData.length} Month{chartData.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs text-muted-foreground"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        className="text-xs text-muted-foreground"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => `RM ${value}`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Line 
                        type="monotone"
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ 
                          fill: 'hsl(var(--primary))', 
                          strokeWidth: 2,
                          stroke: 'hsl(var(--background))',
                          r: 5 
                        }}
                        activeDot={{ 
                          r: 7, 
                          fill: 'hsl(var(--primary))',
                          stroke: 'hsl(var(--background))',
                          strokeWidth: 3
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Insights */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-6 text-foreground">Performance Insights</h2>
            <CashBillInsights historyItems={historyItems} monthlySummary={monthlySummary} />
          </div>

          {/* Transaction Management */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-6 text-foreground">Transaction Management</h2>
            <CashBillTransactionTable 
              historyItems={historyItems} 
              onDeleteEntry={handleDeleteEntry} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashBillSummary;