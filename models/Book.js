const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    bookName: String,
    bookGenre: String, 
    bookCondition: String,
    bookPrice: Number,
    sellerName: String,
    image: String, 
    sellerMob: String
});

const Book = mongoose.model("Book", bookSchema);
module.exports = {Book, bookSchema};