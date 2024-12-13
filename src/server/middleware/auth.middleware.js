const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ 
            message: "Không có token được cung cấp!",
            isAuthenticated: false 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ 
            message: "Token không hợp lệ hoặc đã hết hạn!",
            isAuthenticated: false 
        });
    }
};

module.exports = verifyToken; 