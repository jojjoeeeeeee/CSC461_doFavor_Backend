const Users = require('./models/user_schema');
//Token 
//Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMzNiZWMzMmRhN2ViNjk3Mzk4NWM2ZiIsImRldmljZV9pZCI6IjhGRDU3MjkwLTdDRkItNEU1Ni04NDcyLUY0QjUzMkI2NzA4RCIsImlhdCI6MTY0NzgxMjczOCwiYXVkIjoiaHR0cHM6Ly9zd3VoZWxwLmhlcm9rdWFwcC5jb20iLCJpc3MiOiJDb3NjaSIsInN1YiI6InBoYWtraGFyYWNoYXRlLmpvbkBnbWFpbC5jb20ifQ.YYbStb8_jATsh7jr874Zs5-2T8ikfwmu1BtNpUNaZxbnvxOJHmYb8vXfcRSAjckUhKZ43tIN8gEjEqjWHjAfckRwG3Daqe7vaui1rbl_hPJIdWnUHVYyTQvMqcvmF48kacGGn0EbiNetpS79zPT44fEfpaSgFrzQ1IjlrLGuxVI
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