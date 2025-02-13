import { Types } from "mongoose";
import { AVAILABILITY } from "../../../enums/availability";

export enum productSize {
    small = 'S',
    medium = 'M',
    large = 'L',
}

export type IProduct = {
    productName: string;
    description: string;
    additionalInfo: string;
    productCategory: Types.ObjectId;
    size: productSize[];
    color: string[];
    tag: string[];
    featureImage: string;
    additionalImages: string[];
    regularPrice: number;
    discountedPrice: number;
    availability: AVAILABILITY;
}