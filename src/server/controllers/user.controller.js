const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserController = {
    // Đổi tên người dùng
    changeName: async (req, res) => {
        try {
            const { newName } = req.body;
            const user_id = req.user.user_id; // Lấy từ token đã decode trong middleware

            // Kiểm tra tên mới có hợp lệ
            if (!newName || newName.trim().length < 3) {
                return res.status(400).json({
                    message: "Tên mới phải có ít nhất 3 ký tự!"
                });
            }

            // Kiểm tra tên mới có bị trùng không
            const existingUser = await User.findByUsername(newName);
            if (existingUser && existingUser.user_id !== user_id) {
                return res.status(400).json({
                    message: "Tên người dùng đã tồn tại!"
                });
            }

            // Cập nhật tên trong database
            const query = `
                UPDATE "Users" 
                SET user_name = $1
                WHERE user_id = $2
                RETURNING user_id, user_name, email
            `;
            const values = [newName, user_id];
            const result = await User.query(query, values);

            if (!result.rows[0]) {
                return res.status(404).json({
                    message: "Không tìm thấy người dùng!"
                });
            }

            // Tạo token mới với thông tin đã cập nhật
            const newToken = jwt.sign(
                {
                    user_id: result.rows[0].user_id,
                    username: result.rows[0].user_name,
                    email: result.rows[0].email
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: "Đổi tên thành công!",
                token: newToken,
                user: {
                    user_id: result.rows[0].user_id,
                    user_name: result.rows[0].user_name,
                    email: result.rows[0].email
                }
            });

        } catch (error) {
            console.error('Change name error:', error);
            res.status(500).json({
                message: "Lỗi server khi đổi tên!",
                error: error.message
            });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const user_id = req.user.user_id;

            // Kiểm tra các trường bắt buộc
            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới!"
                });
            }

            // Lấy thông tin user hiện tại
            const query = `SELECT * FROM "Users" WHERE user_id = $1`;
            const result = await User.query(query, [user_id]);
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({
                    message: "Không tìm thấy người dùng!"
                });
            }

            // Kiểm tra mật khẩu cũ
            const isValidPassword = await bcrypt.compare(oldPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    message: "Mật khẩu cũ không đúng!"
                });
            }

            // Mã hóa mật khẩu mới
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Cập nhật mật khẩu trong database
            const updateQuery = `
                UPDATE "Users" 
                SET password = $1
                WHERE user_id = $2
                RETURNING user_id, user_name, email
            `;
            const updateResult = await User.query(updateQuery, [hashedNewPassword, user_id]);

            // Tạo token mới
            const token = jwt.sign(
                {
                    user_id: updateResult.rows[0].user_id,
                    username: updateResult.rows[0].user_name,
                    email: updateResult.rows[0].email
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: "Đổi mật khẩu thành công!",
                token,
                user: {
                    user_id: updateResult.rows[0].user_id,
                    user_name: updateResult.rows[0].user_name,
                    email: updateResult.rows[0].email
                }
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                message: "Lỗi server khi đổi mật khẩu!",
                error: error.message
            });
        }
    }
};

module.exports = UserController; 