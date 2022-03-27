const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: String,
    building: String,
    latitude: Number,
    longitude: Number
});

schema.index({ name: 1}, { unique: true });
module.exports = mongoose.model('landmarks', schema)