import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, } from 'discord-akairo';

import { createConnection, } from 'typeorm';
import { default as Entities, SettingsProvider, } from '../struct/db';

import path from 'path';
import Logger from '../struct/util/Logger';

declare module 'discord-akairo' {
	interface AkairoClient {
		readonly commandHandler: CommandHandler;
		readonly inhibitorHandler: InhibitorHandler;
		readonly listenerHandler: ListenerHandler;
		readonly settings: SettingsProvider;
	}
}

interface BoilerConfig {
	owner?: string;
	token?: string;
}

export class BoilerClient extends AkairoClient {
	public readonly commandHandler: CommandHandler = new CommandHandler(this, {
		allowMention: true,
		argumentDefaults: {
			prompt: {
				cancel: 'Command canceled',
				ended: 'Too many attempts, canceling.',
				modifyRetry: (_, phrase) => `${phrase}\nType \`cancel\` to cancel the command.`,
				modifyStart: (_, phrase) => `${phrase}\nType \`cancel\` to cancel the command.`,
				retries: 3,
				time: 30_000,
				timeout: 'Command timed out, canceling.',
			},
		},
		commandUtil: true,
		commandUtilLifetime: 300_000,
		defaultCooldown: 3_000,
		directory: path.join(process.cwd(), 'build', 'commands'),
		handleEdits: true,
		prefix: (message) => this.settings.get(message.guild?.id ?? '0', 'prefix'),
	});

	public readonly inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: path.join(process.cwd(), 'build', 'inhibitors'),
	});

	public readonly listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: path.join(process.cwd(), 'build', 'listeners'),
	});

	private readonly config: BoilerConfig;

	public readonly settings = new SettingsProvider();

	public constructor(config: BoilerConfig) {
		super({
			ownerID: config.owner,
		}, {
			messageCacheLifetime: 120_000,
			messageCacheMaxSize: 1_000,
			partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'],
			ws: {
				intents: [],
			},
		});

		this.config = config;
	}

	private _init() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
		});

		this.commandHandler.loadAll();
		void Logger.INFO`Loaded ${this.commandHandler.modules.size} commands`;

		this.inhibitorHandler.loadAll();
		void Logger.INFO`Loaded ${this.inhibitorHandler.modules.size} inhibitors`;

		this.listenerHandler.loadAll();
		void Logger.LOG`Loaded ${this.listenerHandler.modules.size} listeners`;
	}

	public async start() {
		void this._init();

		await createConnection({
			entities: Entities,
			logging: true,
			name: 'default',
			synchronize: true,
			type: 'postgres',
			url: process.env.PG,
		}).catch((reason) => {
			void Logger.ERROR`Failed to connect to postgres:\n${reason}`;
			return process.exit(1);
		});

		await this.settings.init();
		void this.login(this.config.token);
	}
}
