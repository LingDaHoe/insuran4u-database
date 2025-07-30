import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plus, Trash2 } from "lucide-react";

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

interface CashBillFormProps {
  cashBillData: CashBillData;
  onUpdate: (data: CashBillData) => void;
  onClose: () => void;
}

export const CashBillForm = ({ cashBillData, onUpdate, onClose }: CashBillFormProps) => {
  const [formData, setFormData] = useState<CashBillData>(cashBillData);

  const updateFormData = (field: keyof CashBillData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate totals when items change
      if (field === 'items') {
        const subtotal = value.reduce((sum: number, item: CashBillItem) => sum + item.total, 0);
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
    const newItem: CashBillItem = {
      id: Date.now().toString(),
      description: 'New Service',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    updateFormData('items', [...formData.items, newItem]);
  };

  const updateItem = (itemId: string, field: keyof CashBillItem, value: string | number) => {
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
        <CardTitle>Edit Cash Bill Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Cash Bill Number</label>
            <Input
              value={formData.billNumber}
              onChange={(e) => updateFormData('billNumber', e.target.value)}
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
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md bg-card">
                <div className="col-span-5">
                  <Input
                    placeholder="Service description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 text-base"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary text-center h-10 text-base font-medium"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary text-right h-10 text-base font-medium"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="col-span-2 text-right font-semibold text-foreground min-h-[40px] flex items-center justify-end text-base">
                  RM {item.total.toFixed(2)}
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem(item.id)}
                    className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
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