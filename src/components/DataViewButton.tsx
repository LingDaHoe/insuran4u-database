import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileSpreadsheet } from "lucide-react";
import { DateGroup } from "@/types";
import { DateHeader } from "./DateHeader";
import { DataTable } from "./DataTable";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataViewButtonProps {
  dateGroups: DateGroup[];
  onEdit: (entry: any) => void;
  onDelete: (id: string) => void;
}

export const DataViewButton = ({ 
  dateGroups, 
  onEdit, 
  onDelete 
}: DataViewButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalEntries = dateGroups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          View Data ({totalEntries})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Data Entries ({totalEntries} total)</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          {dateGroups.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first entry using the form.
              </p>
              <p className="text-sm text-muted-foreground">
                Data will be automatically organized by date and can be exported to Excel or CSV format.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {dateGroups.map((group) => (
                <div key={group.date} className="space-y-4">
                  <DateHeader date={group.date} entryCount={group.entries.length} />
                  <DataTable 
                    entries={group.entries} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                  <Separator className="my-6" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};