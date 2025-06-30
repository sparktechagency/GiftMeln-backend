import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { DashboardController } from "./dashboaed.controller";

const router = Router()
router.get("/", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), DashboardController.totalDeliveryAndSubscriber);
export const DashboardRoutes = router;