'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function SummaryPage() {
  const [topCustomers, setTopCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/customers/top');
        const data = await response.json();
        setTopCustomers(data);
      } catch (error) {
        console.error('Failed to fetch top customers', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCustomers();
  }, []);

  return (
    <div className='min-h-screen bg-muted/40 p-8'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Navigation */}
        <div className='flex items-center space-x-4'>
          <Link href='/'>
            <Button variant='outline' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <h1 className='text-3xl font-bold tracking-tight'>Financial Summary</h1>
        </div>

        {/* The Leaderboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center text-xl'>
              <Trophy className='h-5 w-5 mr-2 text-yellow-500' />
              Top 5 Customers by Revenue
            </CardTitle>
            <CardDescription>Your highest performing clients based on total lifetime billed amount.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-4'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='h-16 bg-muted rounded-lg animate-pulse'></div>
                ))}
              </div>
            ) : (
              <div className='space-y-4'>
                {topCustomers.map((customer: any, index: number) => (
                  <div
                    key={customer.customerId}
                    className='flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-all'
                  >
                    <div className='flex items-center space-x-4'>
                      {/* Rank Badge */}
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full font-bold
                        ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                              ? 'bg-gray-200 text-gray-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <p className='font-semibold'>{customer.customerName}</p>
                        <p className='text-sm text-muted-foreground'>{customer.company}</p>
                      </div>
                    </div>
                    <Link
                      href={`/customer/${customer.customerId}`}
                      className='hover:underline hover:text-blue-600 transition-colors'
                    >
                      <div className='text-right'>
                        <p className='font-bold text-lg'>₹{customer.totalRevenue.toLocaleString()}</p>
                        <p className='text-sm text-muted-foreground flex items-center justify-end'>
                          <Receipt className='h-3 w-3 mr-1' />
                          {customer.totalInvoices} Invoices
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
