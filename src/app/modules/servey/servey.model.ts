import { Schema, model, Types } from "mongoose";
import { IServay } from "./servey.interface";


const ServeySchema = new Schema<IServay>({
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    body: [
        {
            _id: { type: Schema.Types.ObjectId, auto: true }, // Auto-generate ObjectId
            question: { type: String, required: true },
            answer: { type: [String], required: true }
        }
    ]
});



export const SurveyModel = model<IServay>("survey", ServeySchema);
