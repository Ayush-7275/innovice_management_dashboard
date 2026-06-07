# ⚡ Powerplay: B2B Invoice Management Dashboard

A full-stack, responsive dashboard built for tracking, creating, and managing client invoices. Developed as a take-home assignment for the Software Development Engineer Internship at Powerplay.

![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)

## 🚀 Tech Stack

**Frontend:**
* Next.js 15 (App Router)
* React & TypeScript
* Tailwind CSS
* Shadcn UI & Radix UI (Headless components)
* Lucide React (Icons)

**Backend:**
* Node.js & Express
* MongoDB & Mongoose (ODM)
* CORS & Dotenv

---

## ✨ Key Features

1. **Robust Data Grid:** Paginated table displaying invoice records (20 items per page) powered by server-side fetching.
2. **Dynamic Filtering & Sorting:** Real-time search by Invoice ID, and server-side filtering by Tax Rate, Status, and Date Sorting.
3. **Advanced MongoDB Aggregations:** A dedicated Summary Dashboard highlighting the "Top 5 Customers" calculated via complex `$lookup` and `$group` aggregation pipelines.
4. **Dynamic Routing:** Individual, dynamic customer profile pages (`/customer/[id]`) displaying summarized metrics (Total Revenue, Total Paid, Outstanding Due) utilizing JavaScript `.reduce()` calculations.
5. **Seamless CRUD Operations:** A centralized, state-aware Modal component handling both the creation of new invoices (POST) and the real-time editing/recalculation of existing ones (PUT).

---

## 🛠️ Local Setup & Quick Start

To run this project locally, you will need to run bun run dev.

### 1. Database Setup
1. Create a `.env` file in the `/backend` directory.
2. Add your MongoDB connection string:
   `MONGO_URI=mongodb+srv://<username>:<password>@cluster...`
3. Run the database seeder to populate dummy data:
   ```bash
   cd backend
   bun run seed.ts