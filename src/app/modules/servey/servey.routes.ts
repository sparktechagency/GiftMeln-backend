import { Router } from "express";
import { SurveyController } from "./servey.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const route = Router()
route.post("/create", auth(USER_ROLES.USER), SurveyController.createSurvey)


route.patch("/:id", auth(USER_ROLES.USER), SurveyController.updateSurvey)


route.get("/:id", auth(USER_ROLES.USER), SurveyController.getAllSurveys)

// export route
export const SurveyRoute = route