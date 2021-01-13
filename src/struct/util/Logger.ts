import chalk from 'chalk';
import util from 'util';

type LoggerFn = (strings: TemplateStringsArray, ...exprs: any[]) => void;

function highlight(input: unknown): string {
	if (input instanceof Error) return chalk.redBright(input.stack ?? input.message);

	switch (typeof input) {
	case 'bigint': return chalk.blueBright(`${input}n`);
	case 'boolean': return (input ? chalk.greenBright : chalk.redBright)(input);
	case 'function': return chalk.gray(input);
	case 'number': return chalk.yellowBright(input);
	case 'object': return util.inspect(input, { depth: 2 });
	case 'string': return chalk.yellowBright(input);
	case 'symbol': return chalk.redBright(`<@${input.description ?? 'sym'}>`);
	case 'undefined': return chalk.gray('undefined');
	default: return chalk.yellowBright(input);
	}
}

export default new Proxy<{ [key: string]: LoggerFn }>({}, {
	get: (_, label: string) => (strings: TemplateStringsArray, ...exprs: any[]): void => {
		const formattedLabel = chalk.
			bold(chalk.blueBright(chalk.underline(`[${label}]`).concat(':'))).
			concat(' ');

		let [highlightedStr] = strings;
		const highlighted = exprs.map(highlight);

		for (let i = 0; i < highlighted.length; i++) highlightedStr += `${highlighted[i]}${strings[i + 1]}`;

		process.stdout.write(`${formattedLabel}${highlightedStr}\n`);
	},
});
