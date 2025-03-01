
import { Types } from "mongoose";

export interface IServay {
    user: Types.ObjectId | undefined;
    body: {
        _id?: Types.ObjectId;
        question: string;
        answer: string[];
    }[];
}

