const {User, validateUser} = require('../models/user');
const {Book, validateBook} = require('../models/book');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).populate(`borrowedBook`, {"name": 1, "score":1}).populate(`bookHistory`, {"name": 1, "score":1});
  res.send(_.pick(user, ['_id', 'name', `borrowedBook`, 'bookHistory']));
});

router.get('/', async (req, res) => {
    const users = await User.find().select({"_id": 1, "name":1});
    res.send(users);
});

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({ name: req.body.name });
    if (user) return res.status(400).send('User already registered.');
  
    user = new User(_.pick(req.body, ['name']));

    await (await user.save()
                     .then(t => t.populate('borrowedBook', 'name').populate("bookHistory", 'name').execPopulate()));

    res.send(_.pick(user, ['_id', 'name']));
});

router.post('/:userId/borrow/:bookId', async (req, res) => {
    const userId = req.params.userId;
    const bookId = req.params.bookId;
    let user = await User.findOne({ _id: userId});
    if (!user) return res.status(404).send('User does not exists!');

    if(user.get("borrowedBook")) return res.status(400).send('User already has a book!');

    let book = await Book.findOne({ _id: bookId});
    if (!book) return res.status(404).send('Book does not exists!');
  
    user.set({"borrowedBook": book.get("_id")})
    await (await user.save()
                     .then(t => t.populate('borrowedBook', {'name': 1, 'score': 1, "_id": 1}).populate("bookHistory", {'name': 1, 'score': 1}).execPopulate()));
    
    res.send(_.pick(user, ['_id', 'name', `borrowedBook`, `bookHistory`]));
});

router.post('/:userId/return/:bookId', async (req, res) => {
    const userId = req.params.userId;
    const bookId = req.params.bookId;
    const bookScore = req.body.score;
    let user = await User.findOne({ _id: userId});
    if (!user) return res.status(404).send('User does not exists!');

    if(!user.get("borrowedBook")) return res.status(400).send('User does not has any book to return!');
    if (bookId != user.get("borrowedBook")) return res.status(400).send('User does not has that book to return!');
    
    let book = await Book.findOne({ _id: bookId});
    if (!book) return res.status(404).send('Book does not exists!');
  
    let bookRates = book.get("scores");
    bookRates.push(bookScore);
    let totalScore = 0;
    bookRates.forEach(element => {
        totalScore += element;
    });
    const avgScore = totalScore / bookRates.length;

    user.set("borrowedBook", null);
    user.bookHistory.push(book.get(`_id`));
    
    book.set("score", avgScore.toFixed(2));
    await book.save();
    await (await user.save()
                     .then(t => t.populate('borrowedBook', {'name': 1, 'score': 1}).populate("bookHistory", {'name': 1, 'score': 1}).execPopulate()));
    
    res.send(_.pick(user, ['_id', 'name', `borrowedBook`, `bookHistory`]));
});
  

module.exports = router; 
