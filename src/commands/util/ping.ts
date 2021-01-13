import { Command, } from 'discord-akairo';
import { Message, } from 'discord.js';

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'util',
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const msg = await message.util!.send('Pinging...');
		const offset = (msg.editedTimestamp ?? msg.createdTimestamp) - (message.editedTimestamp ?? message.createdTimestamp);
		return msg.util!.edit(`🏓 ${this.client.ws.ping}ms 🔁 ${offset}`);
	}
}
