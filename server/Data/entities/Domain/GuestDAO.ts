import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	OneToMany,
} from 'typeorm';
import {OrderDAO} from './OrderDAO';

@Entity()
export class GuestDAO extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	phoneNumber: string;

	@Column()
	name: string;

	@OneToMany(() => OrderDAO, order => order.guest)
	orders: OrderDAO[];
}