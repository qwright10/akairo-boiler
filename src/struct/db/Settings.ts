import { Entity, PrimaryColumn, Column, } from 'typeorm';

@Entity('guild_settings')
export default class Settings {
	@PrimaryColumn({ name: 'id', type: 'text' })
	public id!: string;

	@Column({ name: 'blacklist', type: 'text', array: true })
	public blacklist!: string[];

	@Column({ name: 'prefix', type: 'text' })
	public prefix!: string;
}
