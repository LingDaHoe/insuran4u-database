import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plus, Trash2 } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
}

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onUpdate: (data: InvoiceData) => void;
  onClose: () => void;
}

export const InvoiceForm = ({ invoiceData, onUpdate, onClose }: InvoiceFormProps) => {
  const [formData, setFormData] = useState<InvoiceData>(invoiceData);

  const updateFormData = (field: keyof InvoiceData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate totals when items change
      if (field === 'items') {
        const subtotal = value.reduce((sum: number, item: InvoiceItem) => sum + item.total, 0);
        updated.subtotal = subtotal;
        updated.total = subtotal - updated.discount;
      }
      
      // Recalculate total when discount changes
      if (field === 'discount') {
        updated.total = updated.subtotal - value;
      }
      
      return updated;
    });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: 'New Service',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    updateFormData('items', [...formData.items, newItem]);
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = formData.items.map(item => {
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
    
    updateFormData('items', updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = formData.items.filter(item => item.id !== itemId);
    updateFormData('items', updatedItems);
  };

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Edit Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Invoice Number</label>
            <Input
              value={formData.invoiceNumber}
              onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Issue Date</label>
            <Input
              type="date"
              value={formData.issueDate}
              onChange={(e) => updateFormData('issueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateFormData('dueDate', e.target.value)}
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Service Items</h3>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded">
                <div className="col-span-5">
                  <Input
                    placeholder="Service description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 text-right font-semibold">
                  RM {item.total.toFixed(2)}
                </div>
                <div className="col-span-1 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem(item.id)}
                    className="p-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount */}
        <div className="flex justify-end">
          <div className="w-64">
            <label className="text-sm font-medium mb-1 block">Discount (RM)</label>
            <Input
              type="number"
              value={formData.discount}
              onChange={(e) => updateFormData('discount', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-1 block">Notes</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};