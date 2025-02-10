import { Types } from "mongoose";
import { AVAILABILITY } from "../../../enums/availability";

export type IProduct = {
    productName: string;
    description: string;
    additionalInfo: string;
    productCategory: Types.ObjectId;
    size: "S" | "M" | "L",
    color: string;
    tag: string[];
    featureImage: string;
    additionalImages: string[];
    regularPrice: number;
    discountedPrice: number;
    availability: AVAILABILITY;
}