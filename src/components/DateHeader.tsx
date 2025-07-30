import { Calendar, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface DateHeaderProps {
  date: string;
  entryCount: number;
}

export const DateHeader = ({ date, entryCount }: DateHeaderProps) => {
  const formattedDate = format(new Date(date), "dd MMMM yyyy");
  
  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-info/5 border-l-4 border-l-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{formattedDate}</h2>
            <p className="text-muted-foreground">Data entries for this date</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">{entryCount} entries</span>
        </div>
      </div>
    </Card>
  );
};