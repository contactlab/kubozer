import chalk from 'chalk';

class Logger {
  constructor() {
    this.log = console.log;
    this.logError = console.error;
    this.colors = chalk;
    this.error = chalk.bold.underline.red;
    this.warning = chalk.underline.yellow;
  }

  set(msg, color) {
    this.log(this.colors[color].underline(msg));
  }

  warn(msg) {
    this.log(this.warning(msg));
  }

  fail(msg) {
    this.logError(this.error(msg));
  }
}

export default Logger;
