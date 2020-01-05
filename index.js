const express = require('express');
const app = express();
const config = require('config');
const logger = require('./init/logger');

require('./init/routes')(app);
require('./init/db')();


const port = config.get("app.port");

app.listen(port, () => logger.info(`Listening on port ${port}...`));
