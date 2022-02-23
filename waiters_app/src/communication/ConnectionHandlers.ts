import {DefaultEventsMap} from '@socket.io/component-emitter';
import {io, Socket} from 'socket.io-client';
import Singleton from '../Singleton';
import Notifications from './Notifications';

const serverURL = 'server-url:3000';
export default class ConnectionHandler extends Singleton {
	private socket: Socket;
	private notifications: Notifications = new Notifications();

	constructor() {
		super();
		this.socket = io(serverURL, {autoConnect: false});
	}

	public connect(token: string, onSuccess?: () => void): void {
		this.socket.auth = {token};
		this.socket.connect();

		this.socket.on('connect', () => {
			// Connected successfully to the server
			onSuccess?.();
		});
		this.socket.on('disconnect', reason => {
			if (reason === 'io server disconnect') {
				// the disconnection was initiated by the server, you need to reconnect manually
				this.socket.connect();
			} else {
				// else the socket will automatically try to reconnect
				// Too see the reasons for a disconnect https://socket.io/docs/v4/client-api/#event-disconnect
			}
		});

		this.socket = this.socket;

		this.registerEvents(this.socket);
	}

	private registerEvents(socket: Socket<DefaultEventsMap, DefaultEventsMap>) {
		for (const event in this.notifications.eventToCallback) {
			socket.on(event, this.notifications.eventToCallback[event]);
		}
	}

	public send(event: string, ...params: any[]): void {
		if (this.socket === undefined) {
			throw new Error(
				'A message is sent to the server before a connection is being initialized'
			);
		}
		if (this.socket.connected) {
			this.socket.emit(event, params);
		} else {
			// The connection has disconnected from some reason that should have been specified at the "disconnect" event above
		}
	}
}
