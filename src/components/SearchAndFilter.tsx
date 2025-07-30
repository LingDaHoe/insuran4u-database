import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { DateGroup } from "@/types";

interface SearchAndFilterProps {
  dateGroups: DateGroup[];
  onFilteredResults: (filteredGroups: DateGroup[]) => void;
}

const STATUS_OPTIONS = [
  "All", "Renew", "Not Renew"
];

const VEHICLE_TYPES = [
  "All", "Car", "Motorcycle", "Truck", "Van", "Bus", "Trailer", "Other"
];

const SOURCE_OPTIONS = [
  "All", "Zurich Takaful", "Takaful Ikhlas", "Pacific Insurances", "Allianz", "Syarikat Takaful Malaysia"
];

export const SearchAndFilter = ({ dateGroups, onFilteredResults }: SearchAndFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const applyFilters = () => {
    let filteredGroups = dateGroups.map(group => ({
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

    onFilteredResults(filteredGroups);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setVehicleTypeFilter("All");
    setSourceFilter("All");
    onFilteredResults(dateGroups);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, vehicleTypeFilter, sourceFilter, dateGroups]);

  const hasActiveFilters = searchTerm || statusFilter !== "All" || vehicleTypeFilter !== "All" || sourceFilter !== "All";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search & Filter</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by plate number, name, IC, phone, quote by, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((source) => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};