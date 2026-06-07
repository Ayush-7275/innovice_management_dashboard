"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InvoiceModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  invoiceToEdit = null 
}: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    amount: "",
    taxRate: "18", // Default GST
    status: "Draft",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
  });

  // If we open the modal in "Edit Mode", pre-fill the form!
  useEffect(() => {
    if (invoiceToEdit) {
      setFormData({
        customerId: invoiceToEdit.customerId?._id || invoiceToEdit.customerId,
        amount: invoiceToEdit.amount.toString(),
        taxRate: invoiceToEdit.taxRate.toString(),
        status: invoiceToEdit.status,
        issueDate: new Date(invoiceToEdit.issueDate).toISOString().split("T")[0],
        dueDate: new Date(invoiceToEdit.dueDate).toISOString().split("T")[0],
      });
    } else {
      // Reset for "Create Mode"
      setFormData({
        customerId: "",
        amount: "",
        taxRate: "18",
        status: "Draft",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
      });
    }
  }, [invoiceToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = invoiceToEdit 
        ? `http://localhost:5000/api/invoices/${invoiceToEdit._id}` // Edit (PUT)
        : `http://localhost:5000/api/invoices`; // Create (POST)
        
      const method = invoiceToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess(); // Tell the table to refresh!
        onClose();   // Close the modal
      } else {
        console.error("Failed to save invoice");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{invoiceToEdit ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Customer ID (MongoDB ObjectId)</Label>
            <Input 
              required 
              placeholder="e.g. 65f2a1b..." 
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              disabled={!!invoiceToEdit} // Don't let them change the customer on an existing invoice
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                required 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input 
                type="number" 
                required 
                value={formData.taxRate}
                onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(val) => setFormData({...formData, status: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input 
                type="date" 
                required 
                value={formData.issueDate}
                onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input 
                type="date" 
                required 
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : invoiceToEdit ? "Save Changes" : "Create Invoice"}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}