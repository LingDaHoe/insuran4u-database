import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Edit3, Save, Plus, Trash2, Phone, Mail, MessageCircle, History } from "lucide-react";
import { DataEntry, DateGroup } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import cekapUrusLogo from '@/assets/cekap-urus-logo.png';
import { CashBillForm } from "@/components/CashBillForm";
import { CashBillHistory } from "@/components/CashBillHistory";

interface CashBillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CashBillData {
  billNumber: string;
  issueDate: string;
  dueDate: string;
  items: CashBillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
}

const CashBillEditor = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const cashBillRef = useRef<HTMLDivElement>(null);
  
  const [entry, setEntry] = useState<DataEntry | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [cashBillData, setCashBillData] = useState<CashBillData>({
    billNumber: `CB-${Date.now().toString().slice(-6)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        id: '1',
        description: 'Insurance Premium',
        quantity: 1,
        unitPrice: 500,
        total: 500
      }
    ],
    subtotal: 500,
    tax: 0,
    discount: 0,
    total: 500,
    notes: 'Thank you for your business!'
  });

  // Load entry data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('business-data');
    if (savedData && entryId) {
      try {
        const dateGroups: DateGroup[] = JSON.parse(savedData);
        const foundEntry = dateGroups
          .flatMap(group => group.entries)
          .find(e => e.id === entryId);
        
        if (foundEntry) {
          setEntry(foundEntry);
        } else {
          toast.error("Entry not found");
          navigate("/");
        }
      } catch (error) {
        console.error('Error loading entry:', error);
        toast.error("Error loading entry data");
        navigate("/");
      }
    } else {
      toast.error("No entry ID provided");
      navigate("/");
    }
  }, [entryId, navigate]);

  // Load history count
  useEffect(() => {
    const updateHistoryCount = () => {
      const existingHistory = localStorage.getItem('cash-bill-history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      setHistoryCount(history.length);
    };

    updateHistoryCount();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cash-bill-history') {
        updateHistoryCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateCashBillData = (field: keyof CashBillData, value: any) => {
    setCashBillData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate totals when items change
      if (field === 'items') {
        const subtotal = value.reduce((sum: number, item: CashBillItem) => sum + item.total, 0);
        updated.subtotal = subtotal;
        updated.total = subtotal + updated.tax - updated.discount;
      }
      
      // Recalculate total when tax or discount changes
      if (field === 'tax' || field === 'discount') {
        updated.total = updated.subtotal + updated.tax - updated.discount;
      }
      
      return updated;
    });
  };

  const addItem = () => {
    const newItem: CashBillItem = {
      id: Date.now().toString(),
      description: 'New Service',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    updateCashBillData('items', [...cashBillData.items, newItem]);
  };

  const updateItem = (itemId: string, field: keyof CashBillItem, value: string | number) => {
    const updatedItems = cashBillData.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        
        // Recalculate total for this item
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        
        return updated;
      }
      return item;
    });
    
    updateCashBillData('items', updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cashBillData.items.filter(item => item.id !== itemId);
    updateCashBillData('items', updatedItems);
  };

  const generatePDF = async () => {
    if (!cashBillRef.current) {
      toast.error("Cash Bill content not found");
      return;
    }

    try {
      console.log("Starting PDF generation...");
      
      // Temporarily hide ALL edit buttons and hover effects for PDF generation
      const editButtons = cashBillRef.current.querySelectorAll('.edit-button, .editable-field');
      editButtons.forEach(btn => {
        (btn as HTMLElement).style.display = 'none';
        (btn as HTMLElement).style.visibility = 'hidden';
      });

      // Hide cursor pointer styles
      const editableElements = cashBillRef.current.querySelectorAll('.cursor-pointer');
      editableElements.forEach(el => {
        (el as HTMLElement).style.cursor = 'default';
        (el as HTMLElement).classList.remove('cursor-pointer', 'hover:bg-gray-50');
      });

      // Force a specific height to ensure full content capture and wait longer for DOM updates
      const originalMinHeight = cashBillRef.current.style.minHeight;
      const originalHeight = cashBillRef.current.style.height;
      cashBillRef.current.style.minHeight = 'auto';
      cashBillRef.current.style.height = 'auto';

      // Wait longer for the DOM to fully update
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("Capturing element:", cashBillRef.current);
      console.log("Element dimensions:", cashBillRef.current.offsetWidth, "x", cashBillRef.current.offsetHeight);
      console.log("Scroll dimensions:", cashBillRef.current.scrollWidth, "x", cashBillRef.current.scrollHeight);

      const canvas = await html2canvas(cashBillRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        height: cashBillRef.current.scrollHeight,
        width: cashBillRef.current.scrollWidth,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Ignore all edit-related elements
          return element.classList?.contains('edit-button') || 
                 element.classList?.contains('editable-field') ||
                 element.tagName === 'BUTTON';
        }
      });

      console.log("Canvas created:", canvas.width, "x", canvas.height);

      // Restore original styles
      cashBillRef.current.style.minHeight = originalMinHeight;
      cashBillRef.current.style.height = originalHeight;

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas has no dimensions - content may be hidden");
      }

      const imgData = canvas.toDataURL('image/png', 1.0);
      console.log("Image data length:", imgData.length);

      if (imgData.length < 1000) {
        throw new Error("Generated image appears to be empty");
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`cash-bill-${cashBillData.billNumber}.pdf`);
      
      // Save to history
      saveCashBillToHistory();
      
      // Show edit buttons again
      editButtons.forEach(btn => {
        (btn as HTMLElement).style.display = '';
        (btn as HTMLElement).style.visibility = '';
      });
      
      // Restore cursor styles
      editableElements.forEach(el => {
        (el as HTMLElement).style.cursor = '';
        (el as HTMLElement).classList.add('cursor-pointer', 'hover:bg-gray-50');
      });
      
      console.log("PDF saved successfully");
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Error generating PDF: ${error.message}`);
      
      // Ensure edit buttons are shown again even if there's an error
      const editButtons = cashBillRef.current?.querySelectorAll('.edit-button, .editable-field');
      editButtons?.forEach(btn => {
        (btn as HTMLElement).style.display = '';
        (btn as HTMLElement).style.visibility = '';
      });
      
      const editableElements = cashBillRef.current?.querySelectorAll('.cursor-pointer');
      editableElements?.forEach(el => {
        (el as HTMLElement).style.cursor = '';
        (el as HTMLElement).classList.add('cursor-pointer', 'hover:bg-gray-50');
      });
    }
  };

  const saveCashBillToHistory = () => {
    const historyItem = {
      id: `${cashBillData.billNumber}-${Date.now()}`,
      billNumber: cashBillData.billNumber,
      customerName: entry?.name || 'Unknown Customer',
      total: cashBillData.total,
      date: new Date().toISOString()
    };

    const existingHistory = localStorage.getItem('cash-bill-history');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Check if a bill with the same billNumber already exists
    const existingIndex = history.findIndex(item => item.billNumber === cashBillData.billNumber);
    
    if (existingIndex !== -1) {
      // Update existing entry
      history[existingIndex] = historyItem;
      toast.success("Cash bill updated in history!");
    } else {
      // Add new entry
      history.push(historyItem);
      toast.success("Cash bill saved to history!");
    }
    
    localStorage.setItem('cash-bill-history', JSON.stringify(history));
    setHistoryCount(history.length);
  };

  const shareViaWhatsApp = () => {
    const finalTotal = cashBillData.subtotal - cashBillData.discount;
    const dueDateText = cashBillData.dueDate ? format(new Date(cashBillData.dueDate), 'dd/MM/yyyy') : 'Not set';
    const message = `Cash Bill ${cashBillData.billNumber} for ${entry?.name || 'Customer'}\nTotal: RM ${finalTotal.toFixed(2)}\nDue Date: ${dueDateText}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const EditableField = ({ 
    value, 
    onSave, 
    className = "", 
    type = "text",
    multiline = false 
  }: {
    value: string | number;
    onSave: (value: string | number) => void;
    className?: string;
    type?: string;
    multiline?: boolean;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value.toString());

    const handleSave = () => {
      const finalValue = type === 'number' ? parseFloat(tempValue) || 0 : tempValue;
      onSave(finalValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setTempValue(value.toString());
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={`flex-1 px-2 py-1 border rounded text-xs ${className}`}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
          ) : (
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={`flex-1 h-6 text-xs ${className}`}
              type={type}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
          )}
          <Button size="sm" onClick={handleSave} className="h-5 px-1">
            <Save className="h-3 w-3" />
          </Button>
        </div>
      );
    }

      return (
        <div 
          className={`cursor-pointer hover:bg-blue-50 rounded px-2 py-1 group flex items-center transition-colors duration-200 min-h-[1.75rem] border border-transparent hover:border-blue-200 ${className}`}
          onClick={() => setIsEditing(true)}
          title="Click to edit"
        >
          <span className="flex-1 leading-tight">
            {type === 'number' && typeof value === 'number' ? value.toFixed(2) : value}
          </span>
          <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 edit-button ml-1 text-blue-500" />
        </div>
      );
  };

  if (!entry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cash bill data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Cash Bill Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header aligned with preview box */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-card border border-border rounded-lg p-2 flex items-center gap-2">
              <span className="text-sm px-3 py-1.5 font-semibold font-montserrat">Insuran4U</span>
              <Badge variant="default" className="text-xs px-1.5 py-0.5 rounded-md font-montserrat">
                Cash Bill Editor
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate("/")} 
                className="h-9 w-9"
                title="Back to Database"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowEditForm(true)} 
                className="h-9 w-9"
                title="Edit Cash Bill"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={shareViaWhatsApp} 
                className="h-9 w-9"
                title="Share via WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button 
                size="icon"
                onClick={generatePDF} 
                className="h-9 w-9"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowHistory(true)} 
                  className="h-9 w-9"
                  title="View History"
                >
                  <History className="h-4 w-4" />
                </Button>
                {historyCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {historyCount}
                  </div>
                )}
              </div>
          </div>
        </div>
        <Card className="bg-background shadow-lg">
          <CardContent className="p-0">
            <div ref={cashBillRef} className="p-6 bg-white text-gray-900 font-montserrat min-h-[297mm]">
              {/* Header with Logo and Cash Bill Details */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2">
                    <img src="/public/placeholder.svg" alt="CUD Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">CEKAP URUS DIVERSIFIED</h1>
                    <p className="text-blue-600 font-medium text-sm leading-tight">Insurance Services</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded">
                    <h2 className="text-lg font-bold leading-tight">CASH BILL</h2>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-end items-center space-x-2">
                      <span className="text-gray-600 leading-tight">Bill #:</span>
                      <span className="font-mono font-bold text-blue-600 leading-tight">
                        {cashBillData.billNumber}
                      </span>
                    </div>
                    <div className="flex justify-end items-center space-x-2">
                      <span className="text-gray-600 leading-tight">Date:</span>
                      <span className="font-semibold leading-tight">
                        {cashBillData.issueDate ? format(new Date(cashBillData.issueDate), 'dd MMM yyyy') : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Below Header */}
              <div className="text-center mb-8 border-b border-gray-200 pb-4">
                <div className="flex justify-center items-center space-x-8 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="leading-tight font-medium">09 955 5272 & 019 988 7272</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 leading-tight font-medium">cekapurus@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Company and Client Information */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* From Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 text-sm mb-3">FROM</h3>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm">CEKAP URUS DIVERSIFIED</h4>
                    <div className="text-gray-700 space-y-1 text-xs">
                      <p>LOT PT 5666 HSD 30/97 (TINGKAT BAWAH)</p>
                      <p>DESA BARAKAH 15200 TANAH MERAH</p>
                      <p>KELANTAN, MALAYSIA</p>
                    </div>
                  </div>
                </div>
                
                {/* Bill To Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">CUSTOMER</h3>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm">{entry.name}</h4>
                    <div className="text-gray-700 space-y-1 text-xs">
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                        <span className="font-medium text-gray-600">IC:</span>
                        <span>{entry.ic}</span>
                        {entry.phoneNumber && (
                          <>
                            <span className="font-medium text-gray-600">Phone:</span>
                            <span>{entry.phoneNumber}</span>
                          </>
                        )}
                        <span className="font-medium text-gray-600">Vehicle:</span>
                        <span>{entry.plateNumber} ({entry.vehicleType})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">SERVICES & CHARGES</h3>
                  <Button
                    size="sm"
                    onClick={addItem}
                    className="edit-button bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        <th className="text-left px-4 py-3 font-semibold text-xs w-2/5">Service Description</th>
                        <th className="text-center px-4 py-3 font-semibold text-xs w-1/6">Qty</th>
                        <th className="text-right px-4 py-3 font-semibold text-xs w-1/6">Rate (RM)</th>
                        <th className="text-right px-4 py-3 font-semibold text-xs w-1/6">Amount (RM)</th>
                        <th className="text-center px-4 py-3 font-semibold text-xs w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashBillData.items.map((item, index) => (
                        <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}>
                          <td className="px-4 py-3 align-top">
                            <EditableField
                              value={item.description}
                              onSave={(value) => updateItem(item.id, 'description', value)}
                              className="w-full font-medium text-gray-900 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3 text-center align-top">
                            <div className="flex justify-center">
                              <EditableField
                                value={item.quantity}
                                onSave={(value) => updateItem(item.id, 'quantity', value)}
                                type="number"
                                className="text-center font-medium text-xs min-w-[40px]"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right align-top">
                            <div className="flex justify-end">
                              <EditableField
                                value={item.unitPrice}
                                onSave={(value) => updateItem(item.id, 'unitPrice', value)}
                                type="number"
                                className="text-right font-medium text-xs min-w-[60px]"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right align-top">
                            <div className="font-bold text-blue-600 text-sm leading-none pt-1">
                              {item.total.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center align-top">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="mb-8">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-gray-700">Subtotal:</span>
                          <span className="font-bold">RM {cashBillData.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-gray-700">Discount:</span>
                          <div className="flex items-center">
                            <span className="mr-1 font-semibold text-xs">RM</span>
                            <EditableField
                              value={cashBillData.discount}
                              onSave={(value) => updateCashBillData('discount', value)}
                              type="number"
                              className="font-bold text-sm w-16 text-right"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-600 text-white px-4 py-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">TOTAL:</span>
                          <span className="font-bold text-lg">
                            RM {(cashBillData.subtotal - cashBillData.discount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 text-sm mb-3">NOTES</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <EditableField
                    value={cashBillData.notes}
                    onSave={(value) => updateCashBillData('notes', value)}
                    multiline
                    className="w-full text-gray-800 text-xs"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                  <h4 className="font-bold text-sm mb-1">Thank you for choosing CEKAP URUS DIVERSIFIED</h4>
                  <p className="text-blue-100 text-xs">Your trusted partner for insurance services</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form Modal */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <CashBillForm
            cashBillData={cashBillData}
            onUpdate={(updatedData) => {
              setCashBillData(updatedData);
              toast.success("Cash Bill updated successfully!");
            }}
            onClose={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <CashBillHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </div>
  );
};

export default CashBillEditor;