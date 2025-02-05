import { Types } from "mongoose"

export type IwishlistItems = {
    user: Types.ObjectId | undefined
    event: Types.ObjectId | undefined
} 