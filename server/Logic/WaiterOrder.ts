import {Location, OrderIDO, OrderStatus} from 'api';
import {makeFail, makeGood, mapResponse, ResponseMsg} from '../Response';

import * as WaiterStore from '../Data/Stores/WaiterStore';
import * as OrderStore from '../Data/Stores/OrderStore';
import {getItems} from '../Data/Stores/ItemStore';
import {WaiterDAO} from '../Data/entities/Domain/WaiterDAO';

import {onOrder, getGuestActiveOrder} from './Orders';
import {OrderNotifier} from './OrderNotifier';

import config from '../config.json';
import {NotificationFacade} from './Notification/NotificationFacade';

export function getAllWaiters(): Promise<WaiterDAO[]> {
	return WaiterStore.getWaiters();
}

export function unassignWaiters(orderID: string): Promise<ResponseMsg<void>> {
	return OrderStore.removeWaitersFromOrder(orderID);
}

export async function updateWaiterLocation(
	waiterId: string,
	location: Location
) {
	const orders = await getOrdersByWaiter(waiterId);
	orders.ifGood(orders =>
		orders.forEach(order =>
			onOrder(order.id, o => o.updateWaiterLocation(location))
		)
	);
}

export async function assignWaiter(
	orderIDs: string[],
	waiterID: string
): Promise<ResponseMsg<void>> {
	const waiter = await WaiterStore.getWaiter(waiterID);
	if (waiter === null) {
		return makeFail('The requested waiter does not exit', 400);
	}
	if (!waiter.available) {
		return makeFail('The requested waiter is not available', 400);
	}
	const canAssignResponses = await Promise.all(
		orderIDs.map(orderId =>
			onOrder(orderId, order => makeGood(order.canAssign()))
		)
	);
	const canAssignResponse = mapResponse(canAssignResponses);
	if (canAssignResponse.isSuccess()) {
		const canAssignToOrders = canAssignResponse.getData();
		if (canAssignToOrders.some(can => !can)) {
			return makeFail(
				'All orders must be in a ready status to assign waiters to them',
				400
			);
		}

		// Change the order status
		orderIDs.forEach(orderId =>
			onOrder(orderId, order => order.assign(waiterID))
		);

		// Saves order <-> waiters assignments
		return await OrderStore.assignWaiter(orderIDs, waiterID);
	}
	return makeFail(canAssignResponse.getError());
}

export function getWaiterByOrder(
	orderId: string
): Promise<ResponseMsg<string[]>> {
	return WaiterStore.getWaitersByOrder(orderId);
}

export async function getOrdersByWaiter(
	waiterId: string
): Promise<ResponseMsg<OrderIDO[]>> {
	const orders = await WaiterStore.getOrdersByWaiter(waiterId);
	return orders.ifGood(orders => orders.map(order => order.getDetails()));
}

export async function createOrder(
	guestId: string,
	items: Map<string, number>
): Promise<ResponseMsg<string>> {
	const entries = Array.from(items.entries());
	const filteredEntries = entries.filter(([_, quantity]) => quantity !== 0);
	const quantities = filteredEntries.map(([_, quantity]) => quantity);
	const itemsIds = filteredEntries.map(([id, _]) => id);
	if (filteredEntries.length === 0) {
		return makeFail('You must choose items to order', 400);
	}
	if (quantities.some(quantity => quantity < 0)) {
		return makeFail("You can't order items with negative quantities", 400);
	}
	const allItemsIds: string[] = (await getItems()).map(item => item.id);
	if (itemsIds.some(id => !allItemsIds.includes(id))) {
		return makeFail('The items you chose does not exists', 400);
	}
	const currentOrderResponse = await getGuestActiveOrder(guestId);
	if (currentOrderResponse.isSuccess()) {
		return makeFail(
			"You can't order while having another order active",
			400
		);
	}
	const newOrderResponse = await OrderNotifier.createNewOrder(
		guestId,
		new Map(filteredEntries)
	);
	return newOrderResponse.ifGood(newOrder => newOrder.getID());
}

export async function changeOrderStatus(
	orderID: string,
	newStatus: OrderStatus,
	requesterID: string
): Promise<ResponseMsg<void>> {
	const orderDAO = await OrderStore.getOrder(orderID);
	if (!orderDAO) {
		return makeFail('Requested order does not exists');
	}
	if (
		requesterID !== orderDAO.guest.id &&
		orderDAO.waiters.filter(w => w.id === requesterID).length < 1 &&
		requesterID !== config.admin_id
	) {
		return makeFail(
			"The user does not have permission to change this order's status."
		);
	}
	const hasAssignedWaiters = orderDAO.waiters.length > 0;
	const neededWaitersStatuses: OrderStatus[] = ['assigned', 'on the way'];
	const willUnassignWaiters = !neededWaitersStatuses.includes(newStatus);

	const order = OrderNotifier.createOrder(orderDAO);
	const changeStatusResponse = await order.changeOrderStatus(
		newStatus,
		hasAssignedWaiters && !willUnassignWaiters,
		requesterID !== orderDAO.guest.id
	);

	if (changeStatusResponse.isSuccess() && willUnassignWaiters) {
		const response = await unassignWaiters(orderID);
		if (!response.isSuccess()) {
			console.error(
				`Order's status has been changed to ${newStatus} but could not unassign waiters`,
				response.getError()
			);
		}
	}
	return changeStatusResponse;
}

async function getWaiterName(waiterID: string): Promise<ResponseMsg<string>> {
	const response = await WaiterStore.getWaiter(waiterID);
	if (response !== null) {
		return makeGood(response.username);
	} else {
		return makeFail('There is no waiter with that token');
	}
}

export function locationErrorGuest(orderId: string, errorMsg: string) {
	const facade = new NotificationFacade();
	facade.notifyError(config.admin_id, errorMsg);
	getWaiterByOrder(orderId).then(response =>
		response.ifGood(waiters =>
			waiters.forEach(waiter => {
				facade.notifyError(waiter, errorMsg);
			})
		)
	);
}

export function locationErrorWaiter(errorMsg: string) {
	const facade = new NotificationFacade();
	facade.notifyError(config.admin_id, errorMsg);
}

export default {
	createOrder,
	assignWaiter,
	getAllWaiters,
	getOrdersByWaiter,
	getWaiterByOrder,
	makeAvailable: unassignWaiters,
	updateWaiterLocation,
	changeOrderStatus,
	getWaiterName,
	locationErrorGuest,
	locationErrorWaiter,
};
