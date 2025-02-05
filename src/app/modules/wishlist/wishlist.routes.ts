import { Router } from "express";
import { WishListController } from "./wishlist.controller";

const route = Router()

// all routes for wishlist
route.post('/create', WishListController.createWishList)

route.get('/', WishListController.getAllWishLists)

route.get('/:id', WishListController.getSingleWishlist)


export const wishlistRoutes = route