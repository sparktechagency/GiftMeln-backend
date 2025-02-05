import { AVAILABILITY } from "../../../enums/availability";
import { CATEGORY } from "../../../enums/category";

export type IProduct = {
    productName: string;
    description: string;
    additionalInfo: string;
    productCategory: CATEGORY;
    size: "S" | "M" | "L",
    color: string;
    tag: string[];
    featureImage: string;
    additionalImages: string[];
    regularPrice: number;
    discountedPrice: number;
    availability: AVAILABILITY;
}