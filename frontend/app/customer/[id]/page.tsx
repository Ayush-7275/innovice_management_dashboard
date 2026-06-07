"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Building2, 
  Receipt, 
  IndianRupee, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerProfile() {
  const params = useParams();
  const id = params.id; // Grabs the ID right out of the URL

  const [customerData, setCustomerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/customers/${id}`);
        const data = await response.json();
        setCustomerData(data);
      } catch (error) {
        console.error("Failed to fetch customer profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCustomerProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-muted-foreground/20 rounded-full mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!customerData || customerData.error) {
    return (
      <div className="min-h-screen bg-muted/40 p-8">
        <h1 className="text-2xl font-bold text-destructive">Customer not found</h1>
        <Link href="/summary"><Button className="mt-4">Go Back</Button></Link>
      </div>
    );
  }

  const { profile, metrics, history } = customerData;

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex items-center space-x-4">
          <Link href="/summary">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{profile.customerName}</h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <Building2 className="h-4 w-4 mr-2" /> {profile.company}
            </p>
          </div>
        </div>

        {/* --- Metrics Cards --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{metrics.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{metrics.totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Due</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">₹{metrics.totalDue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalInvoices}</div>
            </CardContent>
          </Card>
        </div>

        {/* --- History Table --- */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((inv: any) => (
                  <TableRow key={inv._id}>
                    <TableCell className="font-medium">{inv.invoiceId}</TableCell>
                    <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{inv.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{inv.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        inv.status === 'Paid' ? 'default' : 
                        inv.status === 'Overdue' ? 'destructive' : 
                        inv.status === 'Draft' ? 'secondary' : 'outline'
                      }>
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}