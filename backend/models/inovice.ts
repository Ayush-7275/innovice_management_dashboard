import { Model, Schema, model,Types } from 'mongoose';

export interface IInvoice extends Document {
  invoiceId: string;
  customerId: Types.ObjectId;
  amount: number;
  total: number;
  tax: number;
  taxRate: number;
  status: string;
  issueDate: Date;
  dueDate: Date;
}

const inoviceSchema = new Schema(
  {
    invoiceId: { type: String, required: true, },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true },
    total: { type: Number, required: true },
    tax: { type: Number, required: true },
    taxRate: { type: Number, required: true },
    status: { type: String, required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> = model<IInvoice>('Invoice', inoviceSchema);
