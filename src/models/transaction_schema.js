const mongoose = require('mongoose');

const location_schema = mongoose.Schema({
    room: String,
    floor: String,
    building: String,
    optional: String,
    latitude: Number,
    longitude: Number
}, { _id : false});

const task_location_schema = mongoose.Schema({
    name: String,
    building: String,
    latitude: Number,
    longitude: Number
}, { _id : false});

//status -> (pending,accept,p_cancel,a_cancel,success)

const schema = mongoose.Schema({
    title: String,
    detail: String,
    type: String,
    reward: String,
    petitioner_id: String,
    applicant_id: String,
    conversation_id: String,
    status: String,
    location: location_schema,
    task_location: task_location_schema,
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('transactions', schema)
