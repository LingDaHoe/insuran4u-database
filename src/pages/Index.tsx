import { useState, useEffect } from "react";
import { DataEntry, DateGroup } from "@/types";
import { DataEntryForm } from "@/components/DataEntryForm";
import { ExportButton } from "@/components/ExportButton";
import { EditEntryModal } from "@/components/EditEntryModal";
import { ThemeToggle } from "@/components/ThemeToggle";

import { FloatingGoogleSheetsButton } from "@/components/FloatingGoogleSheetsButton";
import { DataViewModal } from "@/components/DataViewModal";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Database, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
  
  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('business-data');
    if (savedData) {
      try {
        setDateGroups(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever dateGroups changes
  useEffect(() => {
    localStorage.setItem('business-data', JSON.stringify(dateGroups));
  }, [dateGroups]);

  const saveEntry = (entryData: Omit<DataEntry, 'id' | 'createdAt'>, targetDate: string) => {
    const newEntry: DataEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setDateGroups(prev => {
      const existingGroupIndex = prev.findIndex(group => group.date === targetDate);
      
      if (existingGroupIndex >= 0) {
        // Add to existing date group
        const updated = [...prev];
        updated[existingGroupIndex] = {
          ...updated[existingGroupIndex],
          entries: [...updated[existingGroupIndex].entries, newEntry]
        };
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        // Create new date group
        const newGroup: DateGroup = {
          date: targetDate,
          entries: [newEntry]
        };
        return [newGroup, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    });
  };

  const deleteEntry = (entryId: string) => {
    setDateGroups(prev => 
      prev.map(group => ({
        ...group,
        entries: group.entries.filter(entry => entry.id !== entryId)
      })).filter(group => group.entries.length > 0)
    );
    toast.success("Entry deleted successfully");
  };

  const editEntry = (entry: DataEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const updateEntry = (updatedEntry: DataEntry) => {
    setDateGroups(prev => 
      prev.map(group => ({
        ...group,
        entries: group.entries.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      }))
    );
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      setDateGroups([]);
      localStorage.removeItem('business-data');
      toast.success("All data cleared successfully");
    }
  };

  const totalEntries = dateGroups.reduce((sum, group) => sum + group.entries.length, 0);
  const totalDates = dateGroups.length;
  const allEntries = dateGroups.flatMap(group => group.entries);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6 w-full">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-2 flex items-center gap-2">
                <span className="text-sm px-3 py-1.5 font-semibold font-montserrat">Insuran4U</span>
                <Badge variant="success" className="text-xs px-1.5 py-0.5 rounded-md relative overflow-hidden">
                  <span className="relative z-10">Database V1</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-shine"></div>
                </Badge>
              </div>
            </div>
            
            <ProfileCard className="flex-1 mx-4" />
            
            <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-2 flex-shrink-0">
              <DataViewModal 
                dateGroups={dateGroups}
                onEdit={updateEntry}
                onDelete={deleteEntry}
              />
              <ExportButton dateGroups={dateGroups} />
              <ThemeToggle />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <Database className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-primary">{totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  Across {totalDates} date{totalDates !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Export Ready</CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-success">
                  {totalEntries > 0 ? 'Yes' : 'No'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Excel & CSV formats
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-info/5 to-info/10 border-info/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
                <TrendingUp className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-info">
                  {dateGroups.length > 0 ? 'Recent' : 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dateGroups.length > 0 ? 'Data available' : 'Start adding entries'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Entry Form */}
        <DataEntryForm onSave={saveEntry} existingEntries={allEntries} />

        {/* Floating Google Sheets Button */}
        <FloatingGoogleSheetsButton dateGroups={dateGroups} />

        {/* Edit Modal */}
        <EditEntryModal
          entry={editingEntry}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEntry(null);
          }}
          onSave={updateEntry}
        />
      </div>
    </div>
  );
};

export default Index;