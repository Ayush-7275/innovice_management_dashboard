import mongoose from "mongoose";
import fs from "fs";
import { Customer } from "./models/customer";
import { Invoice } from "./models/inovice";

const MONGO_URI = process.env.MONGO_URI || "";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected Successfully!");

    console.log("Clearing old data...");
    await mongoose.connection.dropDatabase();

    console.log("Reading seed-data.json...");
    const rawData = fs.readFileSync("./seed-data.json", "utf-8");
    console.log(rawData);
    const seedData = JSON.parse(rawData);

    const uniqueCustomers = new Map();
    
    for (const item of seedData) {
      if (!uniqueCustomers.has(item.customer)) {
        uniqueCustomers.set(item.customer, item.company);
      }
    }

    const customerArray = Array.from(uniqueCustomers, ([customer, company]) => ({
      customer,
      company,
    }));

    // insert customers into the database
    console.log(`Inserting ${customerArray.length} unique customers...`);
    const insertedCustomers = await Customer.insertMany(customerArray);//inserting in customer cluster

    // 6. Create a lookup dictionary: { "Customer Name": "ObjectId" }
    // This allows us to quickly link the invoices to the newly created database IDs
    const customerIdMap: Record<string, string> = {};
    for (const x of insertedCustomers) {
      customerIdMap[x.customer] = x._id.toString();
    }

    // 7. Format the Invoice Data
    console.log(`Formatting ${seedData.length} invoices...`);
    const invoiceArray = seedData.map((item: any) => ({
      invoiceId: item.invoiceId,
      customerId: customerIdMap[item.customer], // Imp!!!!!!!!!!!!!!
      amount: item.amount,
      taxRate: item.taxRate,
      tax: item.tax,
      total: item.total,
      status: item.status,
      issueDate: new Date(item.issueDate), 
      dueDate: new Date(item.dueDate),
    }));

    // 8. Insert Invoices into the database
    await Invoice.insertMany(invoiceArray);//inserting in invoice cluster
    console.log(" All invoices inserted successfully!");

  } catch (error) {
    console.error(" Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

// Execute the function
seedDatabase();