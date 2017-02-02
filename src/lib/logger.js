import chalk from 'chalk';

class Logger {
	constructor() {
		this.log = console.log;
		this.logError = console.error;
		this.colors = chalk;
		this.error = chalk.bold.underline.red;
		this.success = chalk.bold.green;
	}

	set(msg, color) {
		this.log(this.colors[color].underline(msg));
	}

	// success(msg) {
	// 	this.log(this.success(msg));
	// }

	fail(msg) {
		this.logError(this.error(msg));
	}
}

export default Logger;
