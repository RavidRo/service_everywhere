import { assignWaiter, getWaitersByOrder, getOrders } from "../network/api";

export default class OrdersViewModel {
  getOrders() {
    return getOrders();
  }
}
