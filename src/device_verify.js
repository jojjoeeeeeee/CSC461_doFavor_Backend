const Users = require('./models/user_schema');

module.exports = {
    verify: async (req,res,next) => {
        const userId = req.userId;
        const deviceId = req.deviceId;

        const data = await Users.findById(userId);
        if(!data) return res.status(404).json({result: 'Not found', message: 'User not found', data: {}});

        if(data.device_id !== deviceId) {
            return res
            .status(401)
            .json({ reslt: 'nOK', message: 'session expired', data: {}});
        }
        next();
    }
};