import { Router } from "express";
import { WishListController } from "./wishlist.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const route = Router()

// all routes for wishlist
route.post('/create', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), WishListController.createWishList)

route.get('/',auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), WishListController.getAllWishLists)

route.get('/:id', WishListController.getSingleWishlist)


export const wishlistRoutes = route