import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataEntry } from "@/types";
import { toast } from "sonner";

interface EditEntryModalProps {
  entry: DataEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: DataEntry) => void;
}

const VEHICLE_TYPES = [
  "Car", "Motorcycle", "Truck", "Van", "Bus", "Trailer", "Other"
];

const STATUS_OPTIONS = [
  "Renew", "Not Renew"
];

const SOURCE_OPTIONS = [
  "Zurich Takaful", "Takaful Ikhlas", "Pacific Insurances", "Allianz", "Syarikat Takaful Malaysia"
];

export const EditEntryModal = ({ entry, isOpen, onClose, onSave }: EditEntryModalProps) => {
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [formData, setFormData] = useState({
    plateNumber: "",
    name: "",
    ic: "",
    phoneNumber: "",
    vehicleType: "",
    source: "",
    quoteBy: "",
    numberOfQuotations: 1,
    status: "Renew",
    remarks: ""
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        plateNumber: entry.plateNumber,
        name: entry.name,
        ic: entry.ic,
        phoneNumber: entry.phoneNumber,
        vehicleType: entry.vehicleType,
        source: entry.source,
        quoteBy: entry.quoteBy,
        numberOfQuotations: entry.numberOfQuotations,
        status: entry.status,
        remarks: entry.remarks
      });
      setExpiryDate(entry.expiryDate ? new Date(entry.expiryDate) : undefined);
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plateNumber || !formData.name || !formData.ic) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!entry) return;

    const updatedEntry: DataEntry = {
      ...entry,
      ...formData,
      expiryDate: expiryDate ? format(expiryDate, "yyyy-MM-dd") : ""
    };

    onSave(updatedEntry);
    onClose();
    toast.success("Entry updated successfully!");
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-3 border-b bg-muted/30">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium text-foreground">Edit Entry</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Required Fields */}
            <div className="space-y-2">
              <Label htmlFor="edit-plate-number" className="text-xs font-medium text-foreground">
                Plate Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-plate-number"
                value={formData.plateNumber}
                onChange={(e) => updateFormData("plateNumber", e.target.value)}
                placeholder="e.g., ABC123"
                required
                className="h-7 text-xs bg-background border-input"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-xs font-medium text-foreground">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Full name"
                required
                className="h-7 text-xs bg-background border-input"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-ic" className="text-xs font-medium text-foreground">
                IC Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-ic"
                value={formData.ic}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  const formatted = value.replace(/(\d{6})(\d{2})(\d{4})/, '$1-$2-$3');
                  updateFormData("ic", formatted);
                }}
                placeholder="e.g., 123456-78-9012"
                maxLength={14}
                required
                className="h-7 text-xs bg-background border-input"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-phone" className="text-xs font-medium text-foreground">
                Phone Number
              </Label>
              <Input
                id="edit-phone"
                value={formData.phoneNumber}
                onChange={(e) => {
                  let value = e.target.value;
                  if (!value.startsWith('+60')) {
                    value = '+60' + value.replace(/^\+?60?/, '');
                  }
                  updateFormData("phoneNumber", value);
                }}
                placeholder="e.g., +60123456789"
                className="h-7 text-xs bg-background border-input"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">Vehicle Type</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => updateFormData("vehicleType", value)}>
                <SelectTrigger className="h-7 text-xs bg-background border-input">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-7 justify-start text-left font-normal text-xs bg-background border-input",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {expiryDate ? format(expiryDate, "PPP") : "Pick expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">Renew Under</Label>
              <Select value={formData.source} onValueChange={(value) => updateFormData("source", value)}>
                <SelectTrigger className="h-7 text-xs bg-background border-input">
                  <SelectValue placeholder="Select insurance company" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {SOURCE_OPTIONS.map((source) => (
                    <SelectItem key={source} value={source} className="text-xs">{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-quote-by" className="text-xs font-medium text-foreground">
                Quote By
              </Label>
              <Input
                id="edit-quote-by"
                value={formData.quoteBy}
                onChange={(e) => updateFormData("quoteBy", e.target.value)}
                placeholder="Staff name"
                className="h-7 text-xs bg-background border-input"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-quotations" className="text-xs font-medium text-foreground">
                Number of Quotations
              </Label>
              <Input
                id="edit-quotations"
                type="number"
                min="0"
                value={formData.numberOfQuotations}
                onChange={(e) => updateFormData("numberOfQuotations", parseInt(e.target.value) || 0)}
                className="h-7 text-xs bg-background border-input"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                <SelectTrigger className="h-7 text-xs bg-background border-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remarks field spans 2 columns on md, full width on lg */}
            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <Label htmlFor="edit-remarks" className="text-xs font-medium text-foreground">
                Remarks
              </Label>
              <Textarea
                id="edit-remarks"
                value={formData.remarks}
                onChange={(e) => updateFormData("remarks", e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="resize-none text-xs bg-background border-input focus:ring-0 focus:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-3 pt-3 border-t bg-muted/20 -mx-3 px-3">
            <Button type="button" variant="outline" onClick={onClose} className="h-7 px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" className="h-7 px-3 text-xs bg-primary hover:bg-primary/90">
              <Save className="mr-1 h-3 w-3" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};