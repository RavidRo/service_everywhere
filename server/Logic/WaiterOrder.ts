import {v4 as uuidv4} from 'uuid';
import {makeFail, makeGood, ResponseMsg} from '../Response';
import { IOrder } from './IOrder';
import { OrderNotifier } from './OrderNotifier';
import { Waiter } from './Waiter';

export class WaiterOrder {
	static waiterList: Waiter[] = [];
	static orderList: IOrder[] = [];
	static waiterToOrders: Map<string, string[]> = new Map();
	static orderToWaiters: Map<string, string[]> = new Map();

	static connectWaiter(): string {
		let waiter = new Waiter();
		this.waiterList.push(waiter);
		return waiter.id;
	}

	static assignWaiter(orderId: string, waiterId: string): void {
		let orders = this.waiterToOrders.get(waiterId);
		if (orders) {
			orders.push(orderId);
		} else {
			this.waiterToOrders.set(waiterId, [orderId]);
		}
		let waiters = this.orderToWaiters.get(orderId);
		if (waiters) {
			waiters.push(waiterId);
		} else {
			this.orderToWaiters.set(orderId, [waiterId]);
		}
	}

	static getWaiterByOrder(orderId: string): ResponseMsg<string[]> {
		let waiters = this.orderToWaiters.get(orderId);
		if (waiters) {
			return makeGood(waiters);
		}
		return makeGood([]);
	}

	static getWaiterOrder(waiterId: string): ResponseMsg<string[]> {
		let orders = this.waiterToOrders.get(waiterId);
		if (orders) {
			return makeGood(orders);
		}
		return makeGood([]);
	}

	static createOrder(guestId: string, items: Map<string,number>): string{
		let newOrder = OrderNotifier.createOrder(guestId, items)
		this.orderList.push(newOrder)
		return newOrder.getId()
	}
}
