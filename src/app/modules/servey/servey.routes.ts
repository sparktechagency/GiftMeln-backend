import { Router } from 'express';
import { SurveyController } from './servey.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const route = Router();
route.post(
  '/create',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SurveyController.createSurvey
);
route.get(
  '/all',
  auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SurveyController.getAllSurveysAllForAdmin
);

route.get(
  '/single/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SurveyController.getSingleSurvey
);
route.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SurveyController.getAllSurveys,
);
route.patch(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SurveyController.updateSurvey
);



// export route
export const SurveyRoute = route;
