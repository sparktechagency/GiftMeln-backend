import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.routes';
import { EventRoutes } from '../app/modules/event/event.routes';
import { wishlistRoutes } from '../app/modules/wishlist/wishlist.routes';
import { productRoute } from '../app/modules/product/product.routes';
import { CategoryRoutes } from '../app/modules/category/category.routes';
import { PackageRoutes } from '../app/modules/package/package.routes';
import { PaymentRoutes } from '../app/modules/payment/payment.routes';
import { CartRoutes } from '../app/modules/cart/cart.routes';
import { ContactRoutes } from '../app/modules/contact/contact.route';
import { OneTimePaymentRoutes } from '../app/modules/onetimepayment/onetimepayment.routes';
import { SurveyRoute } from '../app/modules/servey/servey.routes';
import { CustomerManagementRoutes } from '../app/modules/customermanagement/customermanagement.route';
import { EventCategoryRoutes } from '../app/modules/eventcategory/eventcategory.route';
import { GiftCollectionRoutes } from '../app/modules/giftcollection/giftcollection.route';
import { NotificationRoute } from '../app/modules/notification/notification.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/event',
    route: EventRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoute,
  },
  {
    path: '/wishlist',
    route: wishlistRoutes,
  },
  {
    path: '/product',
    route: productRoute,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/package',
    route: PackageRoutes,
  },
  {
    path: '/payment',
    route: PaymentRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
  {
    path: '/product-history',
    route: OneTimePaymentRoutes,
  },
  {
    path: '/survey',
    route: SurveyRoute,
  },
  {
    path: '/customer',
    route: CustomerManagementRoutes,
  },
  {
    path: '/event-category',
    route: EventCategoryRoutes,
  },
  {
    path: '/gift-collection',
    route: GiftCollectionRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
