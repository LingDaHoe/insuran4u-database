import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { DateGroup } from "@/types";
import * as XLSX from "xlsx-js-style";
import { format } from "date-fns";
import { toast } from "sonner";

interface ExportButtonProps {
  dateGroups: DateGroup[];
}

export const ExportButton = ({ dateGroups }: ExportButtonProps) => {
  const exportToExcel = () => {
    if (dateGroups.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Sort date groups by date
    const sortedDateGroups = [...dateGroups].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group by month
    const monthGroups = new Map<string, DateGroup[]>();
    sortedDateGroups.forEach(group => {
      const monthKey = format(new Date(group.date), 'yyyy-MM');
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, []);
      }
      monthGroups.get(monthKey)!.push(group);
    });
    
    // Create worksheet with separate sections for each month
    const ws = XLSX.utils.aoa_to_sheet([]);
    let currentRow = 0;
    
    // Column headers
    const headers = [
      'Entry Date', 'Plate Number', 'Name', 'IC', 'Phone Number', 
      'Vehicle Type', 'Expiry Date', 'Source', 'Quote By', 
      'Number of Quotations', 'Status', 'Remarks', 'Created At'
    ];
    
    // Process each month separately
    Array.from(monthGroups.entries()).forEach(([monthKey, monthDateGroups], monthIndex) => {
      const monthDate = new Date(monthKey + '-01');
      const monthHeader = format(monthDate, 'MMMM yyyy');
      
      // Add month header
      XLSX.utils.sheet_add_aoa(ws, [[monthHeader]], { origin: XLSX.utils.encode_cell({ r: currentRow, c: 0 }) });
      currentRow++;
      
      // Add column headers for this month
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: XLSX.utils.encode_cell({ r: currentRow, c: 0 }) });
      currentRow++;
      
      // Prepare data for this month
      const monthEntries = monthDateGroups.flatMap(group => 
        group.entries.map(entry => ([
          format(new Date(group.date), 'dd/MM/yyyy'),
          entry.plateNumber,
          entry.name,
          entry.ic,
          entry.phoneNumber,
          entry.vehicleType,
          entry.expiryDate ? format(new Date(entry.expiryDate), 'dd/MM/yyyy') : '',
          entry.source,
          entry.quoteBy,
          entry.numberOfQuotations,
          entry.status,
          entry.remarks,
          format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')
        ]))
      );
      
      // Add month data
      XLSX.utils.sheet_add_aoa(ws, monthEntries, { origin: XLSX.utils.encode_cell({ r: currentRow, c: 0 }) });
      currentRow += monthEntries.length;
      
      // Add spacing between months (except for the last month)
      if (monthIndex < monthGroups.size - 1) {
        currentRow += 2;
      }
    });

    // Get the range after adding data
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Calculate total entries for styling
    const totalEntries = sortedDateGroups.reduce((sum, group) => sum + group.entries.length, 0);
    
    // Style headers and data with proper styling for each month section
    let styleRow = 0;
    Array.from(monthGroups.entries()).forEach(([monthKey, monthDateGroups]) => {
      // Style month header
      const monthCell = ws[XLSX.utils.encode_cell({ r: styleRow, c: 0 })];
      if (monthCell) {
        monthCell.s = {
          font: { name: "Tahoma", sz: 12, bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "1F4E79" } }, // Dark blue background
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
      
      // Merge month header across all columns
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({ s: { r: styleRow, c: 0 }, e: { r: styleRow, c: headers.length - 1 } });
      styleRow++;
      
      // Style column headers for this month
      for (let col = 0; col < headers.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: styleRow, c: col });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { name: "Tahoma", sz: 12, bold: true, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "9DC3E6" } }, // Light blue background
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }
      styleRow++;
      
      // Style data rows for this month
      const monthEntries = monthDateGroups.flatMap(group => group.entries);
      for (let i = 0; i < monthEntries.length; i++) {
        for (let col = 0; col < headers.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: styleRow, c: col });
          if (ws[cellAddress]) {
            let fillColor = "FFFFFF"; // Default white
            
            // Status-based coloring for status column
            if (col === 10) { // Status column
              const entry = monthEntries[i];
              if (entry.status === "Renew") {
                fillColor = "D4F5D4"; // Light green
              } else if (entry.status === "Not Renew") {
                fillColor = "FFD4D4"; // Light red
              }
            }
            
            ws[cellAddress].s = {
              font: { name: "Tahoma", sz: 12 },
              fill: { fgColor: { rgb: fillColor } },
              alignment: { 
                horizontal: [0, 6, 9, 10].includes(col) ? "center" : "left", 
                vertical: "center" 
              },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
              }
            };
          }
        }
        styleRow++;
      }
      
      // Add spacing between months
      if (monthKey !== Array.from(monthGroups.keys()).pop()) {
        styleRow += 2;
      }
    });

    // Set row heights - match the original design
    const rowHeights = [];
    let rowHeightIndex = 0;
    
    Array.from(monthGroups.entries()).forEach(([monthKey, monthDateGroups]) => {
      rowHeights[rowHeightIndex] = { hpt: 39 }; // Month header height
      rowHeightIndex++;
      rowHeights[rowHeightIndex] = { hpt: 39 }; // Column headers height
      rowHeightIndex++;
      
      // Data rows use default height
      const monthEntries = monthDateGroups.flatMap(group => group.entries);
      for (let i = 0; i < monthEntries.length; i++) {
        rowHeights[rowHeightIndex] = { hpt: 20 }; // Data row height
        rowHeightIndex++;
      }
      
      // Add spacing between months
      if (monthKey !== Array.from(monthGroups.keys()).pop()) {
        rowHeightIndex += 2;
      }
    });

    ws['!rows'] = rowHeights;

    // Set column widths - match the original design structure
    ws['!cols'] = [
      { wch: 13.17 }, // Entry Date
      { wch: 15.17 }, // Plate Number  
      { wch: 21.50 }, // Name
      { wch: 21.33 }, // IC
      { wch: 19.8 },  // Phone Number
      { wch: 22.50 }, // Vehicle Type
      { wch: 18.5 },  // Expiry Date
      { wch: 15.33 }, // Source
      { wch: 12.0 },  // Quote By
      { wch: 23.0 },  // No of Quotations
      { wch: 10 },    // Status
      { wch: 25 },    // Remarks
      { wch: 20 }     // Created At
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Business Data");

    // Generate filename with current date
    const filename = `business-data-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    // Write file with proper options
    XLSX.writeFile(wb, filename, { 
      bookType: 'xlsx',
      compression: true
    });
    
    toast.success(`Exported ${totalEntries} entries to Excel with formatting!`);
  };

  const exportToCSV = () => {
    if (dateGroups.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Prepare data for CSV
    const allEntries = dateGroups.flatMap(group => 
      group.entries.map(entry => ({
        'Entry Date': format(new Date(group.date), 'dd/MM/yyyy'),
        'Plate Number': entry.plateNumber,
        'Name': entry.name,
        'IC': entry.ic,
        'Phone Number': entry.phoneNumber,
        'Vehicle Type': entry.vehicleType,
        'Expiry Date': entry.expiryDate ? format(new Date(entry.expiryDate), 'dd/MM/yyyy') : '',
        'Source': entry.source,
        'Quote By': entry.quoteBy,
        'Number of Quotations': entry.numberOfQuotations,
        'Status': entry.status,
        'Remarks': entry.remarks,
        'Created At': format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')
      }))
    );

    // Convert to CSV
    const headers = Object.keys(allEntries[0] || {});
    const csvContent = [
      headers.join(','),
      ...allEntries.map(entry => 
        headers.map(header => {
          const value = entry[header as keyof typeof entry];
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `business-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${allEntries.length} entries to CSV successfully!`);
  };

  const totalEntries = dateGroups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={totalEntries === 0} className="text-success hover:text-success">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};