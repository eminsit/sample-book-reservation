const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5, maxlength: 50 },
  bookHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: `Book`
  }], 
  borrowedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `Book`
  },
});

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = { 
    name: Joi.string().min(5).max(50).required()
  };

  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validateUser = validateUser;