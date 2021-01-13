import { Inhibitor, } from 'discord-akairo';
import { Message, } from 'discord.js';

export default class BlacklistInhibitor extends Inhibitor {
	public constructor() {
		super('blacklist', {
			reason: 'blacklist',
			type: 'post',
			priority: 5,
		});
	}

	public async exec(message: Message) {
		const blacklist = await this.client.settings.get(message.guild?.id ?? '0', 'blacklist');
		return blacklist.includes(message.author.id);
	}
}
