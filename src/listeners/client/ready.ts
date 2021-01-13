import { Listener, } from 'discord-akairo';
import Logger from '../../struct/util/Logger';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			event: 'ready',
			emitter: 'client',
			category: 'client',
		});
	}

	public exec() {
		void Logger.LOG`Logged in as ${this.client.user?.tag ?? 'Unknown'}`;
	}
}
