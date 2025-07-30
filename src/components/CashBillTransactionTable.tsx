import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, FileText, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";

interface CashBillHistoryItem {
  id: string;
  billNumber: string;
  customerName: string;
  total: number;
  date: string;
}

interface CashBillTransactionTableProps {
  historyItems: CashBillHistoryItem[];
  onDeleteEntry: (entryId: string) => void;
}

const CashBillTransactionTable = ({ historyItems, onDeleteEntry }: CashBillTransactionTableProps) => {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  const getFilteredItems = () => {
    let filtered = [...historyItems];

    // Apply filter
    if (filter === "current-month") {
      const currentMonth = format(new Date(), 'yyyy-MM');
      filtered = filtered.filter(item => 
        format(new Date(item.date), 'yyyy-MM') === currentMonth
      );
    } else if (filter === "last-30-days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(item => new Date(item.date) >= thirtyDaysAgo);
    } else if (filter === "high-value") {
      const avgValue = historyItems.reduce((sum, item) => sum + item.total, 0) / historyItems.length;
      filtered = filtered.filter(item => item.total > avgValue);
    }

    // Apply sorting
    if (sortBy === "date-desc") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "date-asc") {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "amount-desc") {
      filtered.sort((a, b) => b.total - a.total);
    } else if (sortBy === "amount-asc") {
      filtered.sort((a, b) => a.total - b.total);
    } else if (sortBy === "customer") {
      filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();
  const totalFiltered = filteredItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction Management
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40 h-8">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="current-month">This Month</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="high-value">High Value</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Latest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                <SelectItem value="customer">Customer A-Z</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="secondary" className="text-xs font-mono">
              {filteredItems.length} of {historyItems.length}
            </Badge>
          </div>
        </div>
        
        {filter !== "all" && (
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              Filtered Results: {filteredItems.length} transactions
            </div>
            <div className="text-sm font-medium">
              Total: <span className="font-mono text-success">RM {totalFiltered.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {filteredItems.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TableRow>
                  <TableHead className="w-24">Bill #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead className="w-24">Time</TableHead>
                  <TableHead className="text-right w-28">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, index) => {
                  const isHighValue = item.total > (totalFiltered / filteredItems.length);
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-mono text-sm">
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {item.billNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.customerName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(item.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {format(new Date(item.date), 'HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-mono font-bold ${isHighValue ? 'text-success' : 'text-foreground'}`}>
                            RM {item.total.toFixed(2)}
                          </span>
                          {isHighValue && (
                            <Badge variant="default" className="text-xs px-1.5 py-0.5">
                              High
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteEntry(item.id)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Transactions Found</p>
            <p className="text-sm mt-1">
              {filter === "all" 
                ? "Start generating bills to see transactions" 
                : "Try adjusting your filter criteria"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashBillTransactionTable;