const mongoose = require('mongoose');

const location_schema = mongoose.Schema({
    room: String,
    floor: String,
    building: String,
    optional: String,
    latitude: String,
    longitude: String
}, { _id : false});

const schema = mongoose.Schema({
    title: String,
    detail: String,
    type: String,
    reward: String,
    petitioner_id: String,
    applicant_id: String,
    conversation_id: String,
    status: String,
    localtion: location_schema,
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('transcations', schema)