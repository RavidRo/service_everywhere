import {Location, OrderID, WaiterID} from '../api'
import { Order } from '../Logic/Order'

function getWaiterOrder(waiterID: WaiterID): Order[]{
    var ret: Order[] = []
    return ret
    //return waiter.getWaiterOrder(waiterID)
}

function getGuestLocation(orderID: OrderID): Location{
    return Order.getGuestLocation(orderID)
}

function orderArrived(orderID: OrderID): void{
    Order.delegate(orderID, (order: Order) => {order.orderArrived(); return true})
}

export default {
    getWaiterOrder,
    getGuestLocation,
    orderArrived
}