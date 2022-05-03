const Users = require('../models/user_schema');
const ReportAppLogs = require('../models/reportAppLog_schema');

const { appReportValidation } = require('../services/validation');

exports.report = async (req,res) => {
    const userId = req.userId

    const { error } = appReportValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    try {
        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        req.body.report_owner = userId
        const data = await ReportAppLogs.create(req.body)
        
        res.status(200).json({result: 'OK', message: 'success report transactions', data: data});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }

}