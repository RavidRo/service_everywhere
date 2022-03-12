import RequestsHandler from './RequestsHandler';
import Singleton from '../Singleton';
import {ItemIdo, OrderIdo} from '../ido';

export default class Requests extends Singleton {
	private handler: RequestsHandler;
	constructor() {
		super();
		this.handler = new RequestsHandler();
	}

	getWaiterOrders(): Promise<OrderIdo[]> {
		return this.handler.get<OrderIdo[]>('getWaiterOrders');
	}

	login(): Promise<string> {
		return this.handler.post<string>('connectWaiter');
	}

	getItems(): Promise<ItemIdo[]> {
		return this.handler.get<ItemIdo[]>('getItems');
	}
}
