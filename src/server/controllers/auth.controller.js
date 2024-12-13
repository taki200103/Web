const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');

const AuthController = {
    register: async (req, res) => {
        try {
            const { user_name, email, password } = req.body;

            // Kiểm tra username đã tồn tại
            const existingUser = await User.findByUsername(user_name);
            if (existingUser) {
                return res.status(400).json({ message: "Tên người dùng đã tồn tại!" });
            }

            // Kiểm tra email đã tồn tại
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: "Email đã được sử dụng!" });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo user_id
            const user_id = uuidv4().substring(0, 8);

            // Tạo user mới
            const newUser = await User.create({
                user_id,
                user_name,
                email,
                password: hashedPassword
            });

            res.status(201).json({
                message: "Đăng ký thành công!",
                user: {
                    user_id: newUser.user_id,
                    user_name: newUser.user_name,
                    email: newUser.email
                }
            });

        } catch (error) {
            res.status(500).json({ message: "Lỗi server!", error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Kiểm tra user tồn tại bằng email thay vì username
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: "Email không tồn tại!" });
            }

            // Kiểm tra mật khẩu
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Mật khẩu không đúng!" });
            }

            // Tạo JWT token
            const token = jwt.sign(
                { 
                    user_id: user.user_id, 
                    email: user.email,
                    username: user.user_name 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: "Đăng nhập thành công!",
                token,
                user: {
                    user_id: user.user_id,
                    username: user.user_name,
                    email: user.email
                }
            });

        } catch (error) {
            res.status(500).json({ message: "Lỗi server!", error: error.message });
        }
    }
};

module.exports = AuthController; 