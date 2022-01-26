import Order from './Order';

export default class OrderModel {
	private _orders: Map<string, Order>;
	constructor() {
		this._orders = new Map();
		// makeObservable(this, {
		// 	_orders:
		// })
	}

	get orders() {
		return Array.from(this._orders.values());
	}

	setOrders(newOrders: Order[]) {
		this._orders.clear();
		newOrders.forEach(order => {
			this._orders.set(order.id, order);
		});
	}

	setLocation(orderID: string, location: Location) {
		const order = this._orders.get(orderID);
		if (order) {
			order.location = location;
		}
	}
}