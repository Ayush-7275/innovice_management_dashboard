import { Model, Schema, model } from "mongoose";

export interface ICustomer extends Document {
  customer: string;
  company: string;
}

const customerScheama = new Schema({
  customer : {type: String, required: true},
  company : {type: String, required: true},
}, {timestamps: true});

export const Customer: Model<ICustomer> = model<ICustomer>("Customer", customerScheama);