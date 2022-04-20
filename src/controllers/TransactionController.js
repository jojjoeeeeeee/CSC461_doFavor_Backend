const Users = require('../models/user_schema');
const Transactions = require('../models/transaction_schema');
const ReportLogs = require('../models/reportLog_schema');

const moment = require('moment');

const { getLocation, getTypes } = require('../services/utilities');

const { transactionValidation, transactionStateChangeValidation, transactionReportValidation } = require('../services/validation');

exports.getFormData = async (req,res) => {

    const locationData = await getLocation();
    const typeData = await getTypes();
    if (locationData === '500' || typeData === '500') return res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    
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

        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        req.body.status = 'pending'
        const data = await Transactions.create(req.body)
        
        data.conversation_id = `${data._id}_conversation`

        await Transactions.findByIdAndUpdate(data._id, data)
        
        res.status(200).json({result: 'OK', message: 'success create transactions', data: data});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }

}

exports.petitionerGet = async (req,res) => {
    const userId = req.userId

    const { error } = transactionStateChangeValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    const { transaction_id } = req.body
    
    try {
        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.findById(transaction_id)
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});
        
        if(data.petitioner_id !== userId) return res.status(403).json({result: 'Forbiden', message: 'access is denied', data: {}});

        const isAccepted = data.applicant_id === '' ? false : true
        
        const schema = {
            id: transaction_id,
            title: data.title,
            detail: data.detail,
            type: data.type,
            reward: data.reward,
            petitioner: {
                id: data.petitioner_id,
                firstname: user_data.name.firstname,
                lastname: user_data.name.lastname
            },
            applicant: {
                id: data.applicant_id,
                firstname: '',
                lastname: ''
            },
            conversation_id: data.conversation_id,
            status: data.status,
            location: data.location,
            task_location: data.task_location,
            isAccepted: isAccepted,
            created: data.created
        }

        if (isAccepted) {
            const applicant_data = await Users.findById(data.applicant_id);
            if(!applicant_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

            schema.applicant.firstname = applicant_data.name.firstname;
            schema.applicant.lastname = applicant_data.name.lastname;
        }

        res.status(200).json({result: 'OK', message: 'success get transactions data', data: schema});
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }

}

exports.applicantGet = async (req,res) => {
    const userId = req.userId

    const { error } = transactionStateChangeValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    const { transaction_id } = req.body
    
    try {
        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.findById(transaction_id)
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        if(data.petitioner_id === userId) return res.status(403).json({result: 'Forbiden', message: 'access is denied', data: {}});

        const isAccepted = data.applicant_id === '' ? false : true

        const petitioner_data = await Users.findById(data.petitioner_id);
        if(!petitioner_data) return res.status(404).json({result: 'Not found', message: '', data: {}});
        
        const schema = {
            id: transaction_id,
            title: data.title,
            detail: data.detail,
            type: data.type,
            reward: data.reward,
            petitioner: {
                id: data.petitioner_id,
                firstname: petitioner_data.name.firstname,
                lastname: petitioner_data.name.lastname
            },
            applicant: {
                id: data.applicant_id,
                firstname: '',
                lastname: ''
            },
            conversation_id: data.conversation_id,
            status: data.status,
            location: data.location,
            task_location: data.task_location,
            isAccepted: isAccepted,
            created: data.created
        }

        if (isAccepted) {
            if (data.applicant_id !== userId) return res.status(403).json({result: 'Forbiden', message: 'access is denied', data: {}});
            schema.applicant.firstname = user_data.name.firstname
            schema.applicant.lastname = user_data.name.lastname
        }

        res.status(200).json({result: 'OK', message: 'success get transactions data', data: schema});
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.getAll = async (req,res) => {
    const userId = req.userId

    try {

        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.find({$and: [
            { status: 'pending' },
            { petitioner_id: {$ne:userId}}
        ]})
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const transactions_data = []

        for(let i = 0; i < data.length; i++) {
            const schema = {
                id: data[i]._id,
                title: data[i].title,
                detail: data[i].detail,
                type: data[i].type,
                reward: data[i].reward,
                petitioner_id: data[i].petitioner_id,
                applicant_id: data[i].applicant_id,
                conversation_id: data[i].conversation_id,
                status: data[i].status,
                location: data[i].location,
                task_location: data[i].task_location,
                moment: moment(data[i].created),
                created: data[i].created
            }
            transactions_data.push(schema)
        }

        const sorted_data = transactions_data.sort((a, b) => a.moment.valueOf() - b.moment.valueOf())

        res.status(200).json({result: 'OK', message: 'success get all transactions', data: {transactons: sorted_data}});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.getHistory = async (req,res) => {
    const userId = req.userId

    try {

        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.find({$or: [
            {petitioner_id: userId},
            {applicant_id: userId}
        ]})
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const transactions_data = []

        for(let i = 0; i < data.length; i++) {
            if (data[i].petitioner_id === userId) {
                const schema = {
                    id: data[i]._id,
                    title: data[i].title,
                    detail: data[i].detail,
                    type: data[i].type,
                    reward: data[i].reward,
                    petitioner_id: data[i].petitioner_id,
                    applicant_id: data[i].applicant_id,
                    conversation_id: data[i].conversation_id,
                    status: data[i].status,
                    location: data[i].location,
                    task_location: data[i].task_location,
                    role: "ฝากซื้อ",
                    moment: moment(data[i].created),
                    created: data[i].created
                }
                transactions_data.push(schema)
            } else {
                const schema = {
                    id: data[i]._id,
                    title: data[i].title,
                    detail: data[i].detail,
                    type: data[i].type,
                    reward: data[i].reward,
                    petitioner_id: data[i].petitioner_id,
                    applicant_id: data[i].applicant_id,
                    conversation_id: data[i].conversation_id,
                    status: data[i].status,
                    location: data[i].location,
                    task_location: data[i].task_location,
                    role: "รับฝาก",
                    moment: moment(data[i].created),
                    created: data[i].created
                }
                transactions_data.push(schema)
            }
        }

        const sorted_data = transactions_data.sort((a, b) => a.moment.valueOf() - b.moment.valueOf())

        res.status(200).json({result: 'OK', message: 'success get transactions history', data: {history: sorted_data}});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.accept = async (req,res) => {
    const userId = req.userId

    const { error } = transactionStateChangeValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    const { transaction_id } = req.body

    try {

        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.findById(transaction_id)
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        if(data.petitioner_id === userId || data.status !== 'pending') return res.status(403).json({result: 'Forbiden', message: 'access is denied', data: {}});

        data.status = 'accept'
        data.applicant_id = userId
        const newData = await Transactions.findByIdAndUpdate(transaction_id, data)

        const petitioner_data = await Users.findById(newData.petitioner_id);
        if(!petitioner_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const schema = {
            id: transaction_id,
            title: newData.title,
            detail: newData.detail,
            type: newData.type,
            reward: newData.reward,
            petitioner: {
                id: newData.petitioner_id,
                firstname: petitioner_data.name.firstname,
                lastname: petitioner_data.name.lastname
            },
            applicant: {
                id: userId,
                firstname: user_data.name.firstname,
                lastname: user_data.name.lastname
            },
            conversation_id: newData.conversation_id,
            status: 'accept',
            location: newData.location,
            task_location: newData.task_location,
            isAccepted: true,
            created: newData.created
        }

        res.status(200).json({result: 'OK', message: 'success accept transaction', data: schema});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.petitionerCancel = async (req,res) => {
    const userId = req.userId

    const { error } = transactionStateChangeValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    const { transaction_id } = req.body
    
    try {
        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.findById(transaction_id)
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        if(data.petitioner_id !== userId) return res.status(403).json({result: 'Forbiden', message: 'access is denied', data: {}});

        data.status = 'p_cancel'
        const newData = await Transactions.findByIdAndUpdate(transaction_id, data)

        const isAccepted = newData.applicant_id === '' ? false : true
        
        const schema = {
            id: transaction_id,
            title: newData.title,
            detail: newData.detail,
            type: newData.type,
            reward: newData.reward,
            petitioner: {
                id: newData.petitioner_id,
                firstname: user_data.name.firstname,
                lastname: user_data.name.lastname
            },
            applicant: {
                id: newData.applicant_id,
                firstname: '',
                lastname: ''
            },
            conversation_id: newData.conversation_id,
            status: 'p_cancel',
            location: newData.location,
            task_location: newData.task_location,
            created: newData.created
        }

        if (isAccepted) {
            const applicant_data = await Users.findById(newData.applicant_id);
            if(!applicant_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

            schema.applicant.firstname = applicant_data.name.firstname;
            schema.applicant.lastname = applicant_data.name.lastname;
        }

        res.status(200).json({result: 'OK', message: 'success cancel transaction', data: schema});
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.applicantCancel = async (req,res) => {
    const userId = req.userId

    const { error } = transactionStateChangeValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    const { transaction_id } = req.body
    
    try {
        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.findById(transaction_id)
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        if(data.petitioner_id === userId || data.applicant_id !== userId || data.status !== 'accept') return res.status(403).json({result: 'Forbiden', message: 'access is denied', data: {}});

        data.status = 'a_cancel'
        const newData = await Transactions.findByIdAndUpdate(transaction_id, data)

        const petitioner_data = await Users.findById(newData.petitioner_id);
        if(!petitioner_data) return res.status(404).json({result: 'Not found', message: '', data: {}});
        
        const schema = {
            id: transaction_id,
            title: newData.title,
            detail: newData.detail,
            type: newData.type,
            reward: newData.reward,
            petitioner: {
                id: newData.petitioner_id,
                firstname: petitioner_data.name.firstname,
                lastname: petitioner_data.name.lastname
            },
            applicant: {
                id: newData.applicant_id,
                firstname: user_data.name.firstname,
                lastname: user_data.name.lastname
            },
            conversation_id: newData.conversation_id,
            status: 'a_cancel',
            location: newData.location,
            task_location: newData.task_location,
            created: newData.created
        }

        res.status(200).json({result: 'OK', message: 'success cancel transaction', data: schema});
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}

exports.report = async (req,res) => {
    const userId = req.userId

    const { error } = transactionReportValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    try {
        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        req.body.report_owner = userId
        const data = await ReportLogs.create(req.body)
        
        res.status(200).json({result: 'OK', message: 'success report transactions', data: data});
        
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }

}

exports.success = async (req,res) => {
    const userId = req.userId

    const { error } = transactionStateChangeValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    const { transaction_id } = req.body
    
    try {
        const user_data = await Users.findById(userId);
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const data = await Transactions.findById(transaction_id)
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        if(data.petitioner_id === userId || data.applicant_id !== userId || data.status !== 'accept') return res.status(403).json({result: 'Forbiden', message: 'access is denied', data: {}});

        data.status = 'success'
        const newData = await Transactions.findByIdAndUpdate(transaction_id, data)

        const petitioner_data = await Users.findById(newData.petitioner_id);
        if(!petitioner_data) return res.status(404).json({result: 'Not found', message: '', data: {}});
        
        const schema = {
            id: transaction_id,
            title: newData.title,
            detail: newData.detail,
            type: newData.type,
            reward: newData.reward,
            petitioner: {
                id: newData.petitioner_id,
                firstname: petitioner_data.name.firstname,
                lastname: petitioner_data.name.lastname
            },
            applicant: {
                id: newData.applicant_id,
                firstname: user_data.name.firstname,
                lastname: user_data.name.lastname
            },
            conversation_id: newData.conversation_id,
            status: 'success',
            location: newData.location,
            task_location: newData.task_location,
            created: newData.created
        }

        res.status(200).json({result: 'OK', message: 'success transaction', data: schema});
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
}