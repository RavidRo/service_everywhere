import {OrderIDO, OrderStatus} from 'api';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	JoinColumn,
	OneToOne,
	ManyToOne,
	JoinTable,
	ManyToMany,
	OneToMany,
} from 'typeorm';
import {GuestDAO} from './GuestDAO';
import {OrderToItemDAO} from './OrderToItemDAO';
import {ReviewDAO} from './ReviewDAO';
import {WaiterDAO} from './WaiterDAO';

@Entity()
export class OrderDAO extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column({default: 'received'})
	status: OrderStatus;

	@Column('datetime', {default: () => Date.now()})
	creationTime: number;

	@Column('datetime', {
		nullable: true,
	})
	completionTime?: number;

	@OneToOne(() => ReviewDAO, {
		nullable: true,
	})
	@JoinColumn()
	review: ReviewDAO;

	@ManyToOne(() => GuestDAO, guest => guest.orders)
	guest: GuestDAO;

	@OneToMany(() => OrderToItemDAO, orderToItems => orderToItems.order)
	orderToItems: OrderToItemDAO[];

	@ManyToMany(() => WaiterDAO, waiter => waiter.orders)
	@JoinTable()
	waiters: WaiterDAO[];

	getDetails(): OrderIDO {
		const items: [string, number][] = this.orderToItems.map(orderToItem => [
			orderToItem.item.id,
			orderToItem.quantity,
		]);
		return {
			id: this.id,
			guestId: this.guest.id,
			items: new Map(items),
			status: this.status,
			creationTime: new Date(this.creationTime),
			completionTime: this.completionTime
				? new Date(this.completionTime)
				: undefined,
		};
	}
}
