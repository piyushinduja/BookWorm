const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const descriptionSchema = new Schema({
    genre: String,
    description: String
});

const Description = mongoose.model("Description", descriptionSchema);
module.exports = Description;