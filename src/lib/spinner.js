import Ora from 'ora';

class Spinner {
	constructor(text) {
		this.spinner = new Ora({text, spinner: 'dots', color: 'green'});
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

export default Spinner;
