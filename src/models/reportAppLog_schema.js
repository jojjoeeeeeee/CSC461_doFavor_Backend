const mongoose = require('mongoose');

const schema = mongoose.Schema({
    email: String,
    detail: String,
    report_owner: String
});

module.exports = mongoose.model('reportAppLogs', schema)