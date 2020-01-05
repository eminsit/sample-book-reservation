const express = require('express');
const user = require('../routes/user');
const book = require('../routes/book');
const logger = require('./logger');

module.exports = function(app) {
  logger.info(app);
  app.use(express.json());
  app.use('/users', user);
  app.use('/books', book);
  app.use(function(req, res){
    res.status(400).send('Bad Request');
  });
}