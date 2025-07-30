import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ExternalLink, Link, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { DateGroup } from "@/types";

interface GoogleSheetsSyncProps {
  dateGroups: DateGroup[];
}

export const GoogleSheetsSync = ({ dateGroups }: GoogleSheetsSyncProps) => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSheetUrl = localStorage.getItem('google-sheet-url');
    const savedApiKey = localStorage.getItem('google-api-key');
    const savedSheetId = localStorage.getItem('google-sheet-id');
    
    if (savedSheetUrl) setSheetUrl(savedSheetUrl);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSheetId) setSheetId(savedSheetId);
    if (savedSheetUrl && savedApiKey && savedSheetId) setIsConnected(true);
  }, []);

  const handleConnect = () => {
    if (!sheetUrl || !apiKey) {
      toast.error("Please provide both Google Sheet URL and API key");
      return;
    }

    // Extract sheet ID from URL
    const extractedSheetId = extractSheetIdFromUrl(sheetUrl);
    if (!extractedSheetId) {
      toast.error("Invalid Google Sheet URL format");
      return;
    }

    // Save settings
    localStorage.setItem('google-sheet-url', sheetUrl);
    localStorage.setItem('google-api-key', apiKey);
    localStorage.setItem('google-sheet-id', extractedSheetId);
    
    setSheetId(extractedSheetId);
    setIsConnected(true);
    toast.success("Connected to Google Sheet successfully!");
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google-sheet-url');
    localStorage.removeItem('google-api-key');
    localStorage.removeItem('google-sheet-id');
    
    setSheetUrl("");
    setApiKey("");
    setSheetId("");
    setIsConnected(false);
    toast.success("Disconnected from Google Sheet");
  };

  const syncToGoogleSheets = async () => {
    if (!isConnected || !sheetId || !apiKey) {
      toast.error("Please connect to Google Sheets first");
      return;
    }

    setIsSyncing(true);
    
    try {
      // Prepare data for Google Sheets
      const allEntries = dateGroups.flatMap(group => 
        group.entries.map(entry => [
          group.date,
          entry.plateNumber,
          entry.name,
          entry.ic,
          entry.phoneNumber,
          entry.vehicleType,
          entry.expiryDate || '',
          entry.source,
          entry.quoteBy,
          entry.numberOfQuotations,
          entry.status,
          entry.remarks,
          new Date(entry.createdAt).toLocaleString()
        ])
      );

      // Add headers
      const sheetData = [
        ['Entry Date', 'Plate Number', 'Name', 'IC', 'Phone Number', 'Vehicle Type', 'Expiry Date', 'Source', 'Quote By', 'Number of Quotations', 'Status', 'Remarks', 'Created At'],
        ...allEntries
      ];

      // Clear existing data and add new data
      const range = `Sheet1!A1:M${sheetData.length}`;
      // First clear the sheet
      const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1:clear?key=${apiKey}`;
      await fetch(clearUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      // Then add new data
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW&key=${apiKey}`;
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: sheetData
        })
      });

      if (response.ok) {
        toast.success(`Successfully synced ${allEntries.length} entries to Google Sheets!`);
      } else {
        throw new Error('Failed to sync data');
      }

    } catch (error) {
      console.error('Sync error:', error);
      toast.error("Failed to sync data to Google Sheets. Please check your API key and permissions.");
    } finally {
      setIsSyncing(false);
    }
  };

  const extractSheetIdFromUrl = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const openGoogleSheet = () => {
    if (sheetUrl) {
      window.open(sheetUrl, '_blank');
    }
  };

  return (
    <Card className="border-2 border-success/20">
      <CardHeader className="bg-gradient-to-r from-success/5 to-success/10">
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-success/20 rounded-lg">
            <Link className="h-5 w-5 text-success" />
          </div>
          <span>Google Sheets Integration</span>
          {isConnected && (
            <CheckCircle className="h-5 w-5 text-success ml-auto" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!isConnected ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheet-url">Google Sheet URL *</Label>
                <Input
                  id="sheet-url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">Google Sheets API Key *</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your Google Sheets API key"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-blue-900">Setup Instructions:</p>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Create a Google Sheet and copy its URL</li>
                      <li>Get a Google Sheets API key from Google Cloud Console</li>
                      <li>Enable Google Sheets API for your project</li>
                      <li>Make sure the sheet is accessible with the API key</li>
                    </ol>
                    <div className="pt-2 border-t border-blue-200">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-700 h-auto p-0"
                        onClick={() => window.open('https://developers.google.com/sheets/api/quickstart/apps-script', '_blank')}
                      >
                        📖 View Complete Setup Tutorial
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleConnect} className="w-full" size="lg">
              <Link className="mr-2 h-4 w-4" />
              Connect to Google Sheets
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-success">Connected to Google Sheets</p>
                  <p className="text-sm text-muted-foreground">Ready to sync data</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={openGoogleSheet}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Sheet
              </Button>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={syncToGoogleSheets} 
                disabled={isSyncing}
                className="flex-1"
                size="lg"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync to Google Sheets'}
              </Button>
              
              <Button variant="outline" onClick={handleDisconnect}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Data will be automatically synced to your Google Sheet when you sync manually.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};