const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: String,
    building: String,
    latitude: Number,
    longitude: Number
});

schema.index({ building: 2}, { unique: true });
module.exports = mongoose.model('landmarks', schema)