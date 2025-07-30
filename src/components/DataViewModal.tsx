import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { Database, Calendar, Edit3, Save, X, Check, Search, Filter, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DateGroup, DataEntry } from "@/types";
import { format, parseISO, getMonth, getYear } from "date-fns";
import { toast } from "sonner";

interface DataViewModalProps {
  dateGroups: DateGroup[];
  onEdit?: (updatedEntry: DataEntry) => void;
  onDelete?: (entryId: string) => void;
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

export const DataViewModal = ({ dateGroups, onEdit, onDelete }: DataViewModalProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDateGroups, setFilteredDateGroups] = useState<DateGroup[]>(dateGroups);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<DataEntry>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  
  // Update filtered results when dateGroups or filters change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = dateGroups.map(group => ({
        ...group,
        entries: group.entries.filter(entry => {
          // Search term filter
          const matchesSearch = !searchTerm || 
            entry.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.ic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.quoteBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.remarks.toLowerCase().includes(searchTerm.toLowerCase());

          // Status filter
          const matchesStatus = statusFilter === "All" || entry.status === statusFilter;

          // Vehicle type filter
          const matchesVehicle = vehicleTypeFilter === "All" || entry.vehicleType === vehicleTypeFilter;

          // Source filter
          const matchesSource = sourceFilter === "All" || entry.source === sourceFilter;

          return matchesSearch && matchesStatus && matchesVehicle && matchesSource;
        })
      })).filter(group => group.entries.length > 0);

      setFilteredDateGroups(filtered);
    };

    applyFilters();
  }, [dateGroups, searchTerm, statusFilter, vehicleTypeFilter, sourceFilter]);
  
  const totalEntries = dateGroups.reduce((sum, group) => sum + group.entries.length, 0);
  const filteredEntries = filteredDateGroups.reduce((sum, group) => sum + group.entries.length, 0);

  const startEditing = (entry: DataEntry) => {
    setEditingEntry(entry.id);
    setEditFormData({ ...entry });
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setEditFormData({});
  };

  const saveEntry = () => {
    if (!editingEntry || !editFormData) return;
    
    if (!editFormData.plateNumber || !editFormData.name || !editFormData.ic) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedEntry: DataEntry = {
      id: editingEntry,
      plateNumber: editFormData.plateNumber || "",
      name: editFormData.name || "",
      ic: editFormData.ic || "",
      phoneNumber: editFormData.phoneNumber || "",
      vehicleType: editFormData.vehicleType || "",
      source: editFormData.source || "",
      quoteBy: editFormData.quoteBy || "",
      numberOfQuotations: editFormData.numberOfQuotations || 0,
      status: editFormData.status || "Renew",
      remarks: editFormData.remarks || "",
      expiryDate: editFormData.expiryDate || "",
      createdAt: editFormData.createdAt || new Date().toISOString()
    };

    onEdit?.(updatedEntry);
    setEditingEntry(null);
    setEditFormData({});
    toast.success("Entry updated successfully!");
  };

  const updateEditFormData = (field: string, value: string | number) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Group data by months
  const groupByMonth = (groups: DateGroup[]) => {
    const monthGroups: { [key: string]: DateGroup[] } = {};
    
    groups.forEach(group => {
      const date = parseISO(group.date);
      const monthYear = `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
      
      if (!monthGroups[monthYear]) {
        monthGroups[monthYear] = [];
      }
      monthGroups[monthYear].push(group);
    });
    
    return Object.entries(monthGroups).map(([monthYear, groups]) => ({
      monthYear,
      monthName: format(parseISO(`${monthYear}-01`), 'MMMM yyyy'),
      groups: groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })).sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  };

  // Generate consistent colors for months
  const getMonthColor = (monthYear: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-violet-500"
    ];
    
    // Create a simple hash from the monthYear string
    let hash = 0;
    for (let i = 0; i < monthYear.length; i++) {
      hash = monthYear.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setVehicleTypeFilter("All");
    setSourceFilter("All");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "All" || vehicleTypeFilter !== "All" || sourceFilter !== "All";

  const monthlyData = groupByMonth(filteredDateGroups);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Button size="icon" variant="outline">
            <Database className="h-4 w-4" />
          </Button>
          {totalEntries > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {totalEntries}
            </Badge>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[85vw] w-full max-h-[90vh] bg-background" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between text-base font-montserrat">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="rounded px-3 py-1">
                <Database className="h-3 w-3 mr-2" />
                Data Overview
              </Badge>
              <div className="flex items-center space-x-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium mb-2 block">Search</label>
                        <Input
                          placeholder="Search by plate, name, IC, phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="text-sm h-8"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium mb-2 block">Status</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All</SelectItem>
                              <SelectItem value="Renew">Renew</SelectItem>
                              <SelectItem value="Not Renew">Not Renew</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-2 block">Vehicle</label>
                          <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All</SelectItem>
                              {VEHICLE_TYPES.slice(1).map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-2 block">Source</label>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            {SOURCE_OPTIONS.slice(1).map((source) => (
                              <SelectItem key={source} value={source}>{source}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {hasActiveFilters && (
                        <Button variant="outline" onClick={clearFilters} size="sm" className="w-full">
                          <X className="mr-2 h-3 w-3" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Badge variant="secondary" className="text-xs px-3 py-1">
                {filteredEntries} of {totalEntries}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[55vh]">
          <div className="space-y-6">
            {filteredDateGroups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No entries match your filters.</p>
              </div>
            ) : (
              monthlyData.map((monthData) => (
                <div key={monthData.monthYear} className="space-y-4">
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b pb-2">
                    <Badge className="text-sm px-3 py-1 font-montserrat bg-primary text-primary-foreground border-0">
                      <Calendar className="h-3 w-3 mr-2" />
                      {monthData.monthName}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {monthData.groups.map((group) => (
                      <div key={group.date} className="border rounded-lg bg-background shadow-sm">
                        <div className="px-4 py-2 border-b bg-muted/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">{format(new Date(group.date), 'EEEE, d')}</span>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {group.entries.length}
                            </Badge>
                          </div>
                        </div>
                <div className="p-4 space-y-4">
                  {group.entries.map((entry, index) => (
                    <div key={entry.id} className="space-y-3">
                        {editingEntry === entry.id ? (
                          // Redesigned inline editing mode
                          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                <Edit3 className="h-3 w-3 mr-1" />
                                Editing Entry
                              </Badge>
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={saveEntry} className="h-8 px-3 text-xs">
                                  <Check className="mr-1 h-3 w-3" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEditing} className="h-8 px-3 text-xs">
                                  <X className="mr-1 h-3 w-3" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">Plate Number *</label>
                                  <Input
                                    value={editFormData.plateNumber || ""}
                                    onChange={(e) => updateEditFormData("plateNumber", e.target.value)}
                                    className="text-sm h-8 bg-background/50"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">Name *</label>
                                  <Input
                                    value={editFormData.name || ""}
                                    onChange={(e) => updateEditFormData("name", e.target.value)}
                                    className="text-sm h-8 bg-background/50"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">IC *</label>
                                  <Input
                                    value={editFormData.ic || ""}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                      const formatted = value.replace(/(\d{6})(\d{2})(\d{4})/, '$1-$2-$3');
                                      updateEditFormData("ic", formatted);
                                    }}
                                    className="text-sm h-8 bg-background/50 font-mono"
                                    maxLength={14}
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">Phone</label>
                                  <Input
                                    value={editFormData.phoneNumber || ""}
                                    onChange={(e) => updateEditFormData("phoneNumber", e.target.value)}
                                    className="text-sm h-8 bg-background/50"
                                  />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">Vehicle Type</label>
                                  <Select 
                                    value={editFormData.vehicleType || ""} 
                                    onValueChange={(value) => updateEditFormData("vehicleType", value)}
                                  >
                                    <SelectTrigger className="text-sm h-8 bg-background/50">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {VEHICLE_TYPES.map((type) => (
                                        <SelectItem key={type} value={type} className="text-sm">{type}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">Source</label>
                                  <Select 
                                    value={editFormData.source || ""} 
                                    onValueChange={(value) => updateEditFormData("source", value)}
                                  >
                                    <SelectTrigger className="text-sm h-8 bg-background/50">
                                      <SelectValue placeholder="Select source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SOURCE_OPTIONS.map((source) => (
                                        <SelectItem key={source} value={source} className="text-sm">{source}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">Quote By</label>
                                  <Input
                                    value={editFormData.quoteBy || ""}
                                    onChange={(e) => updateEditFormData("quoteBy", e.target.value)}
                                    className="text-sm h-8 bg-background/50"
                                  />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-medium text-foreground/80">Status</label>
                                  <Select 
                                    value={editFormData.status || ""} 
                                    onValueChange={(value) => updateEditFormData("status", value)}
                                  >
                                    <SelectTrigger className="text-sm h-8 bg-background/50">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status} className="text-sm">{status}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs font-medium text-foreground/80">Quotations</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={editFormData.numberOfQuotations || 0}
                                      onChange={(e) => updateEditFormData("numberOfQuotations", parseInt(e.target.value) || 0)}
                                      className="text-sm h-8 bg-background/50"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-foreground/80">Expiry Date</label>
                                    <Input
                                      type="date"
                                      value={editFormData.expiryDate || ""}
                                      onChange={(e) => updateEditFormData("expiryDate", e.target.value)}
                                      className="text-sm h-8 bg-background/50"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {editFormData.remarks !== undefined && (
                              <div className="border-t border-primary/20 pt-3">
                                <label className="text-xs font-medium text-foreground/80">Remarks</label>
                                <Textarea
                                  value={editFormData.remarks || ""}
                                  onChange={(e) => updateEditFormData("remarks", e.target.value)}
                                  className="text-sm mt-2 bg-background/50"
                                  rows={2}
                                  placeholder="Add any additional notes..."
                                />
                              </div>
                            )}
                          </div>
                      ) : (
                          // Display mode
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/10 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors group">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs font-bold px-2 py-1">
                                {entry.plateNumber}
                              </Badge>
                            </div>
                            <div className="text-sm font-medium text-foreground">{entry.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{entry.ic}</div>
                            {entry.phoneNumber && (
                              <div className="text-xs text-muted-foreground">{entry.phoneNumber}</div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="text-muted-foreground font-medium">Vehicle:</span> 
                              <Badge variant="outline" className="ml-2 text-xs">
                                {entry.vehicleType || 'Not specified'}
                              </Badge>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground font-medium">Source:</span> 
                              <span className="ml-2 text-foreground">{entry.source || '-'}</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground font-medium">Quote by:</span> 
                              <span className="ml-2 text-foreground">{entry.quoteBy || '-'}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={entry.status === 'Renew' ? 'default' : 'secondary'} 
                                className="text-xs w-fit px-3 py-1 font-medium"
                              >
                                {entry.status}
                              </Badge>
                              <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(entry)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/invoice/${entry.id}`);
                                  }}
                                  className="h-6 px-2 text-xs bg-gradient-to-r from-primary/10 to-primary/20 border-primary/30 text-primary hover:from-primary/20 hover:to-primary/30"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Cash Bill
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground font-medium">Quotes:</span> 
                              <Badge variant="outline" className="ml-2 text-xs">
                                {entry.numberOfQuotations}
                              </Badge>
                            </div>
                            {entry.expiryDate && (
                              <div className="text-xs">
                                <span className="text-muted-foreground font-medium">Expires:</span> 
                                <span className="ml-2 text-foreground font-mono">{format(new Date(entry.expiryDate), 'dd/MM/yyyy')}</span>
                              </div>
                            )}
                          </div>
                          
                          {entry.remarks && (
                            <div className="md:col-span-3 pt-3 border-t border-border/30">
                              <div className="text-xs">
                                <span className="text-muted-foreground font-medium">Remarks:</span> 
                                <span className="ml-2 text-foreground italic">{entry.remarks}</span>
                              </div>
                            </div>
                            )}
                          </div>
                        )}
                        {index < group.entries.length - 1 && <div className="border-b border-border/30 my-3" />}
                      </div>
                    ))}
                  </div>
                </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-3 border-t text-xs text-muted-foreground">
          <span>Showing {filteredEntries} of {totalEntries} entries</span>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};