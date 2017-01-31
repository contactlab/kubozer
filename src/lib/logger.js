import Ora from 'ora';

class Logger {
	constructor() {
		this.spinner = new Ora({text: 'Preparing rockets and fuel to start Kubozer...', spinner: 'dots', color: 'green'});
		this.spinner.start();
	}

	set(msg, color) {
		this.spinner.color = color || 'cyan';
		this.spinner.text = msg;
		this.spinner.start();
	}

	success(msg) {
		this.spinner.color = 'green';
		this.spinner.succeed(msg);
	}

	fail(msg) {
		this.spinner.color = 'red';
		this.spinner.fail(msg);
	}
}

export default Logger;
