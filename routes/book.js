const {Book, validateBook} = require('../models/book');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const logger = require('../init/logger');

router.get('/:id', async (req, res) => {
  logger.info("get book id:" + req.params.id);
  const book = await Book.findById(req.params.id);
  res.send(_.pick(book, ['_id', 'name']));
});

router.get('/', async (req, res) => {
    const books = await Book.find().select({"name":1, "score":1});

    res.send(books);
});

router.post('/', async (req, res) => {
    const { error } = validateBook(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let book = await Book.findOne({ name: req.body.name });
    if (book) return res.status(400).send('Book already registered.');
  
    book = new Book(_.pick(req.body, ['name']));

    await book.save();
    res.send(_.pick(book, ['_id', 'name']));
});
  

module.exports = router; 
