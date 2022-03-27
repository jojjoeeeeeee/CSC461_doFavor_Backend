const mongoose = require('mongoose');

const schema = mongoose.Schema({
    transaction_id: String,
    detail: String,
    report_owner: String
});

module.exports = mongoose.model('reportLogs', schema)