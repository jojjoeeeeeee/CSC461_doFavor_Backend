module.exports = {
    verify: (req,res,next) => {
        if(error) {
            return res
            .status(401)
            .json({ auth: false, message: 'session expired' });
        }
        req.userId = data.user_id
        next();
    }
};