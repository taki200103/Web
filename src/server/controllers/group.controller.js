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
    },

    getUserGroups: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const query = `
                SELECT 
                    g.group_id,
                    g.group_name,
                    g.description AS group_description,
                    gm.role,
                    u.user_name
                FROM "Users" u
                JOIN "Group_Member" gm ON u.user_id = gm.user_id
                JOIN "Group" g ON gm.group_id = g.group_id
                WHERE u.user_id = $1
                ORDER BY g.creation_date DESC, g.time_created DESC
            `;

            const result = await pool.query(query, [user_id]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách nhóm thành công!",
                groups: result.rows
            });

        } catch (error) {
            console.error('Get user groups error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách nhóm!",
                error: error.message
            });
        }
    },

    getGroupDetails: async (req, res) => {
        try {
            const { groupId } = req.params;

            const query = `
                WITH leader_info AS (
                    SELECT u.user_name
                    FROM "Group_Member" gm
                    JOIN "Users" u ON gm.user_id = u.user_id
                    WHERE gm.group_id = $1 
                    AND gm.role = 'leader'
                )
                SELECT 
                    g.group_id,
                    g.group_name,
                    g.description,
                    g.creation_date,
                    g.time_created,
                    l.user_name as leader_name,
                    (
                        SELECT CAST(COUNT(*) AS INTEGER)
                        FROM "Group_Member" 
                        WHERE group_id = $1
                    ) as total_members
                FROM "Group" g
                CROSS JOIN leader_info l
                WHERE g.group_id = $1
            `;

            const result = await pool.query(query, [groupId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thông tin nhóm!"
                });
            }

            // Log để debug
            console.log('Group details:', result.rows[0]);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin nhóm thành công!",
                groupInfo: result.rows[0]
            });

        } catch (error) {
            console.error('Get group details error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thông tin nhóm!",
                error: error.message
            });
        }
    }
};

module.exports = GroupController; 