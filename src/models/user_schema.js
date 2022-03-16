const mongoose = require('mongoose');

const schema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    profile_pic: String,
    name: {
        firstname: String,
        lastname: String
    },
    wallet_id: [String],
    payment_id: [String],
    device_id: String,
    state: String,
    created: { type: Date, default: Date.now }
});

schema.index({ username: 1, email: 3}, { unique: true, unique: true });
module.exports = mongoose.model('users', schema)
