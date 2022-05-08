/* eslint-disable max-len */
import OrdersViewModel from '../viewModel/ordersViewModel';
import WaiterViewModel from '../viewModel/waitersViewModel';
import {isOrder, isOrderStatus, orderStatusType} from '../typeGuard';

export default class Notificiations {
	private ordersViewModel: OrdersViewModel;
	private waitersViewModel: WaiterViewModel;
	constructor(
		ordersViewModel: OrdersViewModel,
		waitersViewModel: WaiterViewModel
	) {
		this.ordersViewModel = ordersViewModel;
		this.waitersViewModel = waitersViewModel;
	}

	addNewOrder(params: object) {
		console.log('Updating new orders', params);
		if (isOrder(params)) {
			this.ordersViewModel.updateOrder(params);
		} else {
			console.warn(
				"Haven't received the correct arguments, the argument should be an order"
			);
		}
	}

	changeOrderStatus(params: object) {
		console.info('Changing order status', params);
		if (isOrderStatus(params)) {
			const orderStatus = params as orderStatusType;
			this.ordersViewModel.changeOrderStatusNotification(
				orderStatus.orderID,
				orderStatus.orderStatus
			);
		} else {
			console.warn(
				"Haven't received the correct arguments, the param should be a order status"
			);
		}
	}

	eventCallbacks: Record<string, (params: object) => void> = {
		newOrder: params => this.addNewOrder(params),
		changeOrderStatus: params => this.changeOrderStatus(params),
		// updateWaiters: params => this.updateWaiters(params),
	};
}
// updateOrderStatus: params => this.updateOrderStatus(params),