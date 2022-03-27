const mongoose = require('mongoose');

const schema = mongoose.Schema({
    title: String,
    title_en: String,
    detail: String
});

schema.index({ title: 1}, { unique: true });
module.exports = mongoose.model('types', schema)