const pool = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const ChatController = {
    getGroupMessages: async (req, res) => {
        try {
            const { groupId } = req.params;
            const query = `
                SELECT 
                    c.chat_id,
                    c.note as text,
                    c.chat_date,
                    c.chat_time,
                    c.user_id,
                    u.user_name as sender,
                    CASE WHEN c.user_id = $2 THEN true ELSE false END as isSelf
                FROM "Chat" c
                JOIN "Users" u ON c.user_id = u.user_id
                WHERE c.group_id = $1
                ORDER BY c.chat_date ASC, c.chat_time ASC
            `;
            
            const result = await pool.query(query, [groupId, req.user.user_id]);
            
            res.status(200).json({
                success: true,
                messages: result.rows
            });
        } catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy tin nhắn!",
                error: error.message
            });
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { groupId } = req.params;
            const { text } = req.body;
            const userId = req.user.user_id;

            // Kiểm tra user có trong group không
            const checkMemberQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2 AND request = 'accepted'
            `;
            const memberCheck = await pool.query(checkMemberQuery, [groupId, userId]);
            
            if (memberCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không phải thành viên của nhóm này!"
                });
            }

            const chatId = uuidv4().substring(0, 8);
            const insertQuery = `
                INSERT INTO "Chat" (chat_id, group_id, user_id, note)
                VALUES ($1, $2, $3, $4)
                RETURNING 
                    chat_id,
                    note as text,
                    chat_date,
                    chat_time,
                    user_id
            `;
            
            const result = await pool.query(insertQuery, [chatId, groupId, userId, text]);
            
            // Lấy thêm thông tin người gửi
            const userQuery = `SELECT user_name as sender FROM "Users" WHERE user_id = $1`;
            const userResult = await pool.query(userQuery, [userId]);

            const message = {
                ...result.rows[0],
                sender: userResult.rows[0].sender,
                isSelf: true
            };

            res.status(201).json({
                success: true,
                message: message
            });
        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi gửi tin nhắn!",
                error: error.message
            });
        }
    }
};

module.exports = ChatController; 