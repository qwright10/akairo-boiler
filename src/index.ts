import {
	BoilerClient,
} from './client/BoilerClient';
import dotenv from 'dotenv';
import Logger from './struct/util/Logger';

dotenv.config();

void Logger.INFO`Current working directory is ${process.cwd()}`;
for (const key of ['OWNER', 'PG', 'TOKEN']) {
	if (!process.env[key]) {
		void Logger.ERROR`Missing .env value: ${key}`;
		process.exit(1);
	}
}

const client = new BoilerClient({
	owner: process.env.OWNER,
	token: process.env.TOKEN,
});
void client.start();
