import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, DollarSign, Info, Trash2, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CashBillHistoryItem {
  id: string;
  billNumber: string;
  customerName: string;
  total: number;
  date: string;
}

interface CashBillHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashBillHistory = ({ isOpen, onClose }: CashBillHistoryProps) => {
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
  }, [isOpen]);

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


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-background font-montserrat">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center text-base">
            <Badge variant="outline" className="rounded px-3 py-1">
              <FileText className="h-3 w-3 mr-2" />
              Cash Bill History
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Clean Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Total Bills</span>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{totalBills}</div>
              <Badge variant="secondary" className="text-xs w-fit">PDFs Generated</Badge>
            </div>

            <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-success/20"
                  onClick={() => navigate('/cash-bill-summary')}
                >
                  <BarChart3 className="h-3 w-3 text-success" />
                </Button>
              </div>
              <div className="text-2xl font-bold text-success mb-1">RM {totalRevenue.toFixed(2)}</div>
              <Badge variant="outline" className="text-xs border-success/30 text-success w-fit">All Time</Badge>
            </div>

            <div className="bg-gradient-to-br from-info/5 to-info/10 border border-info/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">This Month</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-info/20"
                  onClick={() => navigate('/cash-bill-summary')}
                >
                  <BarChart3 className="h-3 w-3 text-info" />
                </Button>
              </div>
              <div className="text-2xl font-bold text-info mb-1">RM {getCurrentMonthTotal().toFixed(2)}</div>
              <Badge variant="outline" className="text-xs border-info/30 text-info w-fit">
                {format(new Date(), 'MMM yyyy')}
              </Badge>
            </div>
          </div>

          {/* Monthly Summary Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs px-2 py-1 bg-transparent">
                Monthly Breakdown
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {Object.keys(monthlySummary).length} Months
              </Badge>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-1">
              {Object.entries(monthlySummary)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, total]) => (
                  <div key={month} className="flex justify-between items-center p-2 bg-muted/5 rounded-md border hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {format(new Date(`${month}-01`), 'MMM yyyy')}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                      RM {total.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              {Object.keys(monthlySummary).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="bg-muted/10 rounded-full p-2 w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                    <FileText className="h-4 w-4 opacity-50" />
                  </div>
                  <p className="text-xs">No cash bills generated yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Start creating bills to see your summary</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bills Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs px-2 py-1 bg-transparent">
                Recent Bills
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                Latest {Math.min(historyItems.length, 10)}
              </Badge>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-1">
              {historyItems
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/10 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {item.billNumber}
                          </Badge>
                          <span className="text-xs truncate">{item.customerName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(item.date), 'dd MMM yyyy, HH:mm')}
                        </div>
                      </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                        RM {item.total.toFixed(2)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(item.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              {historyItems.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="bg-muted/10 rounded-full p-2 w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                    <FileText className="h-4 w-4 opacity-50" />
                  </div>
                  <p className="text-xs">No bills in history</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Generated bills will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};