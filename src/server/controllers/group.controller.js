const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db.config');

const GroupController = {
    createGroup: async (req, res) => {
        try {
            const { groupName, description, members } = req.body;
            const leader_id = req.user.user_id;
            const group_id = uuidv4().substring(0, 4);

            // Kiểm tra tên nhóm đã tồn tại
            const checkNameQuery = `
                SELECT * FROM "Group" 
                WHERE group_name = $1
            `;
            const nameExists = await pool.query(checkNameQuery, [groupName]);
            if (nameExists.rows.length > 0) {
                return res.status(400).json({
                    message: "Tên nhóm đã tồn tại!"
                });
            }

            // Tạo nhóm mới
            const createGroupQuery = `
                INSERT INTO "Group" (group_id, group_name, description)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const groupResult = await pool.query(createGroupQuery, [
                group_id,
                groupName,
                description
            ]);

            // Thêm leader vào nhóm
            const addLeaderQuery = `
                INSERT INTO "Group_Member" (user_id, group_id, role)
                VALUES ($1, $2, 'leader')
            `;
            await pool.query(addLeaderQuery, [leader_id, group_id]);

            // Thêm các thành viên vào nhóm
            if (members && members.length > 0) {
                const addMembersQuery = `
                    INSERT INTO "Group_Member" (user_id, group_id, role)
                    VALUES ($1, $2, 'member')
                `;
                for (const member_id of members) {
                    // Kiểm tra user tồn tại
                    const checkUserQuery = `SELECT * FROM "Users" WHERE user_id = $1`;
                    const userExists = await pool.query(checkUserQuery, [member_id]);
                    
                    if (userExists.rows.length > 0) {
                        await pool.query(addMembersQuery, [member_id, group_id]);
                    }
                }
            }

            res.status(201).json({
                message: "Tạo nhóm thành công!",
                group: {
                    ...groupResult.rows[0],
                    members: [...members, leader_id]
                }
            });

        } catch (error) {
            console.error('Create group error:', error);
            res.status(500).json({
                message: "Lỗi khi tạo nhóm!",
                error: error.message
            });
        }
    }
};

module.exports = GroupController; 