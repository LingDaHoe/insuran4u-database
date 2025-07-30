import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataEntry } from "@/types";
import { toast } from "sonner";
import { validateDataEntry, checkForDuplicateEntry, ValidationError } from "@/utils/validation";

interface DataEntryFormProps {
  onSave: (entry: Omit<DataEntry, 'id' | 'createdAt'>, targetDate: string) => void;
  existingEntries?: DataEntry[];
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

export const DataEntryForm = ({ onSave, existingEntries = [] }: DataEntryFormProps) => {
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: Omit<DataEntry, 'id' | 'createdAt'> = {
      ...formData,
      expiryDate: expiryDate ? format(expiryDate, "yyyy-MM-dd") : ""
    };

    // Validate the entry
    const errors = validateDataEntry(entry);
    
    // Check for duplicates on the same date
    const targetDateString = format(targetDate, "yyyy-MM-dd");
    if (checkForDuplicateEntry(entry, existingEntries, targetDateString)) {
      errors.push({ 
        field: 'duplicate', 
        message: 'An entry with this plate number already exists for this date' 
      });
    }

    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error(`Please fix ${errors.length} validation error(s)`);
      return;
    }

    onSave(entry, format(targetDate, "yyyy-MM-dd"));
    
    // Reset form
    setFormData({
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
    setExpiryDate(undefined);
    
    toast.success("Entry saved successfully!");
  };

  const clearForm = () => {
    setFormData({
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
    setExpiryDate(undefined);
    setValidationErrors([]);
    toast.success("Form cleared!");
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for this field when user starts typing
    setValidationErrors(prev => prev.filter(error => error.field !== field));
  };

  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName);
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-card via-card to-accent/5 overflow-hidden">
      <CardHeader className="relative bg-gradient-to-r from-primary via-primary/90 to-info text-white py-5">
        <div className="absolute inset-0 bg-black/5"></div>
        <CardTitle className="relative flex items-center space-x-3 z-10">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wide">Renewal Data Entry</span>
            <p className="text-xs text-white/80 font-normal mt-0.5">Add new insurance renewal information</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">{/* ... keep existing code */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Date Selection */}
          <div className="bg-gradient-to-r from-muted/50 to-accent/10 p-4 rounded-lg border border-border/50 space-y-2">
            <Label htmlFor="target-date" className="text-sm font-medium text-foreground/80 flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>Entry Date</span>
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-sm">Compulsory</Badge>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 bg-background border focus:border-primary focus:ring-0 focus:outline-none",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={(date) => date && setTargetDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Essential Information */}
          <div className="bg-gradient-to-r from-card to-muted/30 p-4 rounded-lg border border-border/50 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <Badge className="bg-primary text-primary-foreground font-semibold px-2 py-0.5 text-xs rounded-md">
                Essential Information
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plate-number" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <span>Plate Number</span>
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-sm">Compulsory</Badge>
                </Label>
                <Input
                  id="plate-number"
                  value={formData.plateNumber}
                  onChange={(e) => updateFormData("plateNumber", e.target.value)}
                  placeholder="e.g., ABC123"
                  className={cn(
                    "h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none",
                    getFieldError("plateNumber") ? "border-destructive" : ""
                  )}
                  required
                />
                {getFieldError("plateNumber") && (
                  <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError("plateNumber")?.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <span>Name</span>
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-sm">Compulsory</Badge>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Full name"
                  className={cn(
                    "h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none",
                    getFieldError("name") ? "border-destructive" : ""
                  )}
                  required
                />
                {getFieldError("name") && (
                  <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError("name")?.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="ic" className="text-sm font-medium text-foreground">IC Number</Label>
                <Input
                  id="ic"
                  value={formData.ic}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    const formatted = value.replace(/(\d{6})(\d{2})(\d{4})/, '$1-$2-$3');
                    updateFormData("ic", formatted);
                  }}
                  placeholder="123456-78-9012"
                  maxLength={14}
                  className={cn(
                    "h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none",
                    getFieldError("ic") ? "border-destructive" : ""
                  )}
                />
                {getFieldError("ic") && (
                  <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError("ic")?.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!value.startsWith('+60')) {
                      value = '+60' + value.replace(/^\+?60?/, '');
                    }
                    updateFormData("phoneNumber", value);
                  }}
                  placeholder="+60123456789"
                  className={cn(
                    "h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none",
                    getFieldError("phoneNumber") ? "border-destructive" : ""
                  )}
                />
                {getFieldError("phoneNumber") && (
                  <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError("phoneNumber")?.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle & Business Details */}
          <div className="bg-gradient-to-r from-card to-muted/30 p-4 rounded-lg border border-border/50 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <Badge className="bg-primary text-primary-foreground font-semibold px-2 py-0.5 text-xs rounded-md">
                Vehicle & Business Details
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Vehicle Type</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => updateFormData("vehicleType", value)}>
                  <SelectTrigger className="h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Renew Under</Label>
                <Select value={formData.source} onValueChange={(value) => updateFormData("source", value)}>
                  <SelectTrigger className="h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none">
                    <SelectValue placeholder="Select insurance company" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote-by" className="text-sm font-medium text-foreground">Quote By</Label>
                <Input
                  id="quote-by"
                  value={formData.quoteBy}
                  onChange={(e) => updateFormData("quoteBy", e.target.value)}
                  placeholder="Staff name"
                  className="h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                  <SelectTrigger className="h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-card to-muted/30 p-4 rounded-lg border border-border/50 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <Badge className="bg-primary text-primary-foreground font-semibold px-2 py-0.5 text-xs rounded-md">
                Additional Information
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none",
                        !expiryDate && "text-muted-foreground",
                        getFieldError("expiryDate") && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {expiryDate ? format(expiryDate, "PPP") : "Pick expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={(date) => date <= new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {getFieldError("expiryDate") && (
                  <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError("expiryDate")?.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotations" className="text-sm font-medium text-foreground">Number of Quotations</Label>
                <Input
                  id="quotations"
                  type="number"
                  min="0"
                  value={formData.numberOfQuotations}
                  onChange={(e) => updateFormData("numberOfQuotations", parseInt(e.target.value) || 0)}
                  className={cn(
                    "h-9 bg-background border focus:border-primary focus:ring-0 focus:outline-none",
                    getFieldError("numberOfQuotations") ? "border-destructive" : ""
                  )}
                />
                {getFieldError("numberOfQuotations") && (
                  <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError("numberOfQuotations")?.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="remarks" className="text-sm font-medium text-foreground">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => updateFormData("remarks", e.target.value)}
                placeholder="Additional notes..."
                rows={4}
                className="bg-background border focus:border-primary focus:ring-0 focus:outline-none transition-all duration-200 resize-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <div className="flex gap-3">
              <Button type="submit" className="flex-1 h-9" size="default">
                Save
              </Button>
              <Button type="button" variant="outline" onClick={clearForm} className="flex-1 h-9" size="default">
                Clear Entry
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};