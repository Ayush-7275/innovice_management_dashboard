import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Invoice } from './models/inovice';
import { Customer } from './models/customer';

const MONGO_URI = process.env.MONGO_URI || '';

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

const cal = () => {};

app.get('/api/invoices', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Grab all our new filters from the frontend
    const { status, search, taxRate, dateSort } = req.query;

    // 1. Build the dynamic MongoDB query object
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (taxRate && taxRate !== 'all') {
      query.taxRate = Number(taxRate); // Convert string back to number
    }

    if (search) {
      // Use $regex to allow partial matching (e.g., typing "123" finds "INV-123")
      // $options: 'i' makes it case-insensitive
      query.invoiceId = { $regex: search, $options: 'i' };
    }

    // 2. Build the sorting logic
    const sortOptions: any = {};
    if (dateSort === 'oldest') {
      sortOptions.issueDate = 1; // Ascending (Oldest first)
    } else {
      sortOptions.issueDate = -1; // Descending (Newest first - Default)
    }

    const skip = (page - 1) * limit;

    // 3. Execute the query with filters and sorting applied!
    const invoices = await Invoice.find(query)
      .sort(sortOptions)
      .populate('customerId', 'customer company')
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      data: invoices,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit) // total kitne page honge
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.get('/api/customers/top', async (req, res) => {
  try {
    const topCustomers = await Invoice.aggregate([
      {
        $group: {
          _id: '$customerId', // Group by this field
          totalRevenue: { $sum: '$total' },
          totalInvoices: { $sum: 1 }
        }
      },

      {
        $sort: { totalRevenue: -1 }
      },

      {
        $limit: 5
      },

      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id', // The id in the customers collection
          as: 'customerInfo'
        }
      },
      {
        $unwind: '$customerInfo'
      },
      {
        $project: {
          _id: 0,
          customerId: '$_id',
          customerName: '$customerInfo.customer',
          company: '$customerInfo.company',
          totalRevenue: 1,
          totalInvoices: 1
        }
      }
    ]);

    res.status(200).json(topCustomers);
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Customer ID format' });
    }

    const customerInfo = await Customer.findById(id);
    if (!customerInfo) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const invoiceHistory = await Invoice.find({ customerId: new mongoose.Types.ObjectId(id) }).sort({ issueDate: -1 });

    const totalInvoices = invoiceHistory.length;

    const totalRevenue = invoiceHistory.reduce((sum, invoice) => sum + invoice.total, 0);

    // Bonus metric: How much money have they actually paid vs what is owed?
    const totalPaid = invoiceHistory.filter((inv) => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);

    const totalDue = invoiceHistory
      .filter((inv) => inv.status === 'Unpaid' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    // 4. Send the perfectly packaged response to the frontend
    res.status(200).json({
      profile: {
        customerId: customerInfo._id,
        customerName: customerInfo.customer, // Mapping the 'customer' field to a clearer name
        company: customerInfo.company
      },
      metrics: {
        totalInvoices,
        totalRevenue,
        totalPaid,
        totalDue
      },
      history: invoiceHistory
    });
  } catch (err) {
    console.error('Failed to fetch the Profile');
    res.status(500).json({
      error: err
    });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { customerId, amount, taxRate, status, issueDate, dueDate } = req.body;

    // 1. Validate required fields
    if (!customerId || amount === undefined || taxRate === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Generate a random 7-digit invoice ID (e.g., "INV-6598015")
    const generatedInvoiceId = `INV-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // 3. Backend Craft: Calculate financial totals securely on the server
    const calculatedTax = (Number(amount) * Number(taxRate)) / 100;
    const calculatedTotal = Number(amount) + calculatedTax;

    // 4. Create and save the document
    const newInvoice = new Invoice({
      invoiceId: generatedInvoiceId,
      customerId,
      amount: Number(amount),
      taxRate: Number(taxRate),
      tax: calculatedTax,
      total: calculatedTotal,
      status: status || 'Draft', // Default to Draft if not provided
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate)
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});
app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1. Validate the MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Invoice ID format' });
    }

    // 2. If the user changed the amount or tax rate, recalculate the totals!
    if (updateData.amount !== undefined && updateData.taxRate !== undefined) {
      updateData.tax = (Number(updateData.amount) * Number(updateData.taxRate)) / 100;
      updateData.total = Number(updateData.amount) + updateData.tax;
    }

    // 3. Find by ID and Update
    // { new: true } tells Mongoose to return the UPDATED document, not the old one
    // { runValidators: true } ensures they can't sneak in a bad enum status or invalid date
    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 3000');
});
