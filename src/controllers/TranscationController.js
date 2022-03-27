const Users = require('../models/user_schema');
const Transactions = require('../models/transaction_schema')

const { getLocation, getTypes } = require('../services/utilities');

const { transactionValidation } = require('../services/validation');

exports.getFormData = async (req,res) => {

    const locationData = await getLocation();
    const typeData = await getTypes();
    if (locationData == '500' || typeData == '500') return res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    
    const formData = {
        landmark: locationData,
        type: typeData
    }
    
    res.status(200).json({result: 'OK', message: 'success get form data', data: formData});

};

exports.create = async (req,res) => {

    const userId = req.userId

    const { error } = transactionValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    try {

        const user_data = await Users.findOne({email: email});
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        req.body.status = 'pending'
        const data = await Transactions.create(req.body)
        
        //ไปหน้าไหนต่อ
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }

}

exports.get = async (req,res) => {

}

exports.getAll = async (req,res) => {

    const userId = req.userId

    try {

        const user_data = await Users.findOne({email: email});
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.find({ status: 'pending' })
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        res.status(200).json({result: 'OK', message: 'success get all transactions', data: {transactons: data}});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.getHistory = async (req,res) => {
    const userId = req.userId

    try {

        const user_data = await Users.findOne({email: email});
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.find({$or: [
            {petitioner_id: userId},
            {applicant_id: userId}
        ]})
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        res.status(200).json({result: 'OK', message: 'success get transactions history', data: {history: data}});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.accept = async (req,res) => {

}

exports.petitionerCancel = async (req,res) => {
    
}

exports.applicantCancel = async (req,res) => {

}