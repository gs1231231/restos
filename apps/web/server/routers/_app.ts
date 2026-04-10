import { router } from '../trpc';
import { restaurantRouter } from './restaurant';
import { menuRouter } from './menu';
import { tableRouter } from './table';
import { orderRouter } from './order';
import { kotRouter } from './kot';
import { billRouter } from './bill';
import { paymentRouter } from './payment';
import { reservationRouter } from './reservation';
import { staffRouter } from './staff';
import { inventoryRouter } from './inventory';
import { customerRouter } from './customer';
import { reportRouter } from './report';

export const appRouter = router({
  restaurant: restaurantRouter,
  menu: menuRouter,
  table: tableRouter,
  order: orderRouter,
  kot: kotRouter,
  bill: billRouter,
  payment: paymentRouter,
  reservation: reservationRouter,
  staff: staffRouter,
  inventory: inventoryRouter,
  customer: customerRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
