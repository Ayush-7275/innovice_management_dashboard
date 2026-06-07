'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import InvoiceModal from '@/components/InnoviceModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InvoicesDashboard() {
  // --- PAGINATION & DATA STATE ---
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 20;

  // --- MODAL STATE (This is what you were missing!) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taxFilter, setTaxFilter] = useState('all');
  const [dateSort, setDateSort] = useState('newest');

  // 1. Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Reset page to 1 if a filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, taxFilter, dateSort]);

  // 1. Debounce the search term (wait 500ms after user stops typing before setting it)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Reset page to 1 if a filter changes!
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // 3. Fetch Data (Triggers when page, debouncedSearch, or statusFilter changes)
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });

        // Attach filters to the URL if they exist!
        if (debouncedSearch) queryParams.append('search', debouncedSearch);
        if (statusFilter !== 'all') queryParams.append('status', statusFilter);
        if (taxFilter !== 'all') queryParams.append('taxRate', taxFilter);
        if (dateSort !== 'newest') queryParams.append('dateSort', dateSort);

        const response = await fetch(`http://localhost:5000/api/invoices?${queryParams}`);
        const result = await response.json();

        setInvoices(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalRecords(result.pagination.total);
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
}, [page, debouncedSearch, statusFilter, taxFilter, dateSort]);
  return (
    <div className='min-h-screen bg-muted/40 p-8'>
      <div className='max-w-6xl mx-auto bg-background rounded-xl border shadow-sm overflow-hidden'>
        {/* --- TOP NAVIGATION --- */}
        <div className='flex justify-between items-center p-6 border-b'>
          <h1 className='text-2xl font-semibold tracking-tight'>Invoices</h1>
          <div className='flex space-x-3'>
            <Link href='/summary'>
              <Button variant='outline'>Summary</Button>
            </Link>
            <Button
              onClick={() => {
                setSelectedInvoice(null); // Ensure it opens in "Create" mode
                setIsModalOpen(true);
              }}
            >
              New invoice
            </Button>
          </div>
        </div>

        {/* --- FILTER TOOLBAR --- */}
        <div className='flex justify-between items-center p-4 border-b bg-muted/20'>
          <div className='relative w-1/3'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              type='text'
              placeholder='Search invoice ID...'
              className='pl-10 bg-background'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex space-x-2'>
            {/* The Connected Status Dropdown */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className='w-32.5 bg-background'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='Paid'>Paid</SelectItem>
                <SelectItem value='Overdue'>Overdue</SelectItem>
                <SelectItem value='Sent'>Sent</SelectItem>
                <SelectItem value='Draft'>Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* The Tax Rate Dropdown */}
            <Select value={taxFilter} onValueChange={(value) => setTaxFilter(value)}>
              <SelectTrigger className='w-30 bg-background'>
                <SelectValue placeholder='Tax Rate' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Taxes</SelectItem>
                <SelectItem value='0'>0%</SelectItem>
                <SelectItem value='5'>5%</SelectItem>
                <SelectItem value='18'>18%</SelectItem>
                <SelectItem value='28'>28%</SelectItem>
              </SelectContent>
            </Select>

            {/* The Date Sorting Dropdown */}
            <Select value={dateSort} onValueChange={(value) => setDateSort(value)}>
              <SelectTrigger className='w-35 bg-background'>
                <SelectValue placeholder='Sort Date' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Newest First</SelectItem>
                <SelectItem value='oldest'>Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 hover:bg-muted/50'>
              <TableHead className='w-30 cursor-pointer'>
                <div className='flex items-center'>
                  Invoice <ArrowUpDown className='ml-2 h-3 w-3' />
                </div>
              </TableHead>
              <TableHead className='cursor-pointer'>
                <div className='flex items-center'>
                  Customer <ArrowUpDown className='ml-2 h-3 w-3' />
                </div>
              </TableHead>
              <TableHead className='cursor-pointer'>
                <div className='flex items-center'>
                  Amount <ArrowUpDown className='ml-2 h-3 w-3' />
                </div>
              </TableHead>
              <TableHead>Tax%</TableHead>
              <TableHead className='cursor-pointer'>
                <div className='flex items-center'>
                  Total <ArrowUpDown className='ml-2 h-3 w-3' />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className='h-4 bg-muted rounded w-20 animate-pulse'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-muted rounded w-32 animate-pulse'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-muted rounded w-20 animate-pulse'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-muted rounded w-10 animate-pulse'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-muted rounded w-24 animate-pulse'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-6 bg-muted rounded-full w-16 animate-pulse'></div>
                    </TableCell>
                  </TableRow>
                ))
              : invoices.map((inv: any) => (
                  <TableRow key={inv._id}>
                    <TableCell className='font-medium'>{inv.invoiceId}</TableCell>
                    <TableCell>{inv.customerId?.customer || 'Unknown'}</TableCell>
                    <TableCell>₹{inv.amount.toLocaleString()}</TableCell>
                    <TableCell>{inv.taxRate}%</TableCell>
                    <TableCell className='font-medium'>₹{inv.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'Paid'
                            ? 'default'
                            : inv.status === 'Overdue'
                              ? 'destructive'
                              : inv.status === 'Draft'
                                ? 'secondary'
                                : 'outline'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {/* --- PAGINATION FOOTER --- */}
        <div className='flex justify-between items-center p-4 border-t bg-muted/20 text-sm text-muted-foreground'>
          <div>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalRecords)} of {totalRecords.toLocaleString()}
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' size='icon' onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <Button variant='default' size='sm' className='h-8 w-8'>
              {page}
            </Button>

            <Button
              variant='outline'
              size='icon'
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
      {/* --- INVOICE MODAL --- */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Re-fetch the data when saving is successful!
          const fetchInvoices = async () => {
            const queryParams = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString()
            });
            const response = await fetch(`http://localhost:5000/api/invoices?${queryParams}`);
            const result = await response.json();
            setInvoices(result.data);
          };
          fetchInvoices();
        }}
        invoiceToEdit={selectedInvoice}
      />
    </div>
  );
}
