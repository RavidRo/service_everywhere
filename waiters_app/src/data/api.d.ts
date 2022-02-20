export type Order = {
	id: OrderID;
	items: string[];
	status: 'unassigned' | 'inprogress' | 'completed';
};

type Location = {
	x: number;
	y: number;
};
type Arrived = boolean;
type OrderID = string;
type WaiterID = string;

type Api = {
	// Guest
	createOrder: () => OrderID;
	updateLocationGuest: (location: Location, orderID: OrderID) => void;
	hasOrderArrived: () => Arrived;

	// Dashboard
	getOrders: () => Order[];
	assignWaiter: (orderID: OrderID, waiterID: WaiterID) => void;
	getWaiters: () => WaiterID[];
	getWaiterByOrder: (orderID: OrderID) => WaiterID;

	// Waiter
	getWaiterOrders: (waiterID: WaiterID) => Order[];
	getGuestLocation: (orderID: OrderID) => Location;
	orderArrived: (orderID: OrderID) => void;
	login: () => WaiterID;
};