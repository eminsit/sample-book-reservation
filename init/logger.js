const { createLogger, format, transports } = require('winston');
const config = require('config');

const logger = createLogger({
  colored: true,
  level: config.get("log.level"),
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()]
});

module.exports = logger; 
