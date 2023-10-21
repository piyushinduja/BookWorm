const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { bookSchema } = require('./Book');

const userSchema = new Schema({
    userEmail: String,
    userPassword: String, 
    userMobile: String,
    favourites : [bookSchema]
});

const User = mongoose.model('User', userSchema);
module.exports = User;