import { Schema, model } from 'mongoose';
import { ICustomermanagement, CustomermanagementModel } from './customermanagement.interface'; 

const customermanagementSchema = new Schema<ICustomermanagement, CustomermanagementModel>({
  // Define schema fields here
});

export const Customermanagement = model<ICustomermanagement, CustomermanagementModel>('Customermanagement', customermanagementSchema);
