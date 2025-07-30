import { DataEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

interface DataTableProps {
  entries: DataEntry[];
  onEdit: (entry: DataEntry) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-success text-success-foreground';
    case 'approved': return 'bg-success text-success-foreground';
    case 'pending': return 'bg-warning text-warning-foreground';
    case 'in progress': return 'bg-info text-info-foreground';
    case 'rejected': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const DataTable = ({ entries, onEdit, onDelete }: DataTableProps) => {
  if (entries.length === 0) {
    return (
      <div className="bg-background border rounded-lg p-8 text-center">
        <p className="text-muted-foreground text-sm">No entries found for this date.</p>
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-medium text-sm">Entries ({entries.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="text-xs font-medium text-muted-foreground">Plate</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Name</TableHead>
              <TableHead className="hidden md:table-cell text-xs font-medium text-muted-foreground">IC</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-medium text-muted-foreground">Phone</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-medium text-muted-foreground">Vehicle</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-medium text-muted-foreground">Expiry</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-medium text-muted-foreground">Source</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-medium text-muted-foreground">Quote By</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-medium text-muted-foreground">Quotes</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="border-b last:border-b-0 hover:bg-muted/30">
                <TableCell className="font-medium text-sm">{entry.plateNumber}</TableCell>
                <TableCell className="text-sm">{entry.name}</TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{entry.ic}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{entry.phoneNumber}</TableCell>
                <TableCell className="hidden sm:table-cell text-xs">{entry.vehicleType}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">
                  {entry.expiryDate && format(new Date(entry.expiryDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs">{entry.source}</TableCell>
                <TableCell className="hidden xl:table-cell text-xs">{entry.quoteBy}</TableCell>
                <TableCell className="hidden lg:table-cell text-center text-xs">{entry.numberOfQuotations}</TableCell>
                <TableCell>
                  <Badge variant={entry.status === 'Renew' ? 'default' : 'secondary'} className="text-xs">
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      className="h-7 w-7 p-0 hover:bg-muted"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};