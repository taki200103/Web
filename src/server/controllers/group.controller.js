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
    },

    getGroupMembers: async (req, res) => {
        try {
            const { groupId } = req.params;
            const user_id = req.user.user_id;

            // Kiểm tra role của user
            const checkRoleQuery = `
                SELECT role FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2
            `;
            const roleResult = await pool.query(checkRoleQuery, [groupId, user_id]);
            const isLeader = roleResult.rows[0]?.role === 'leader';

            // Lấy danh sách thành viên
            const query = `
                SELECT 
                    u.user_id,
                    u.user_name,
                    gm.role,
                    gm.date_join,
                    gm.time_join
                FROM "Group_Member" gm
                JOIN "Users" u ON gm.user_id = u.user_id
                WHERE gm.group_id = $1
                ORDER BY gm.date_join DESC, gm.time_join DESC
            `;

            const result = await pool.query(query, [groupId]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách thành viên thành công!",
                members: result.rows,
                isLeader
            });

        } catch (error) {
            console.error('Get group members error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách thành viên!",
                error: error.message
            });
        }
    },

    addGroupMember: async (req, res) => {
        try {
            const { groupId } = req.params;
            const { userId } = req.body;
            const leader_id = req.user.user_id;

            // Kiểm tra người thêm có phải leader không
            const checkLeaderQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2 AND role = 'leader'
            `;
            const leaderResult = await pool.query(checkLeaderQuery, [groupId, leader_id]);
            
            if (leaderResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Chỉ leader mới có quyền thêm thành viên!"
                });
            }

            // Kiểm tra user tồn tại
            const checkUserQuery = `SELECT * FROM "Users" WHERE user_id = $1`;
            const userExists = await pool.query(checkUserQuery, [userId]);
            
            if (userExists.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy user!"
                });
            }

            // Thêm thành viên mới
            const addMemberQuery = `
                INSERT INTO "Group_Member" (user_id, group_id, role)
                VALUES ($1, $2, 'member')
                RETURNING *
            `;
            await pool.query(addMemberQuery, [userId, groupId]);

            res.status(200).json({
                success: true,
                message: "Thêm thành viên thành công!"
            });

        } catch (error) {
            console.error('Add member error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi thêm thành viên!",
                error: error.message
            });
        }
    },

    deleteGroupMember: async (req, res) => {
        try {
            const { groupId, memberId } = req.params;
            const leader_id = req.user.user_id;

            console.log('Delete request:', { groupId, memberId, leader_id });

            // Bắt đầu transaction
            await pool.query('BEGIN');

            try {
                // Kiểm tra người xóa có phải leader không
                const checkLeaderQuery = `
                    SELECT role FROM "Group_Member"
                    WHERE group_id = $1 AND user_id = $2
                `;
                const leaderResult = await pool.query(checkLeaderQuery, [groupId, leader_id]);
                console.log('Leader check result:', leaderResult.rows);

                if (leaderResult.rows.length === 0 || leaderResult.rows[0].role !== 'leader') {
                    await pool.query('ROLLBACK');
                    return res.status(403).json({
                        success: false,
                        message: "Chỉ leader mới có quyền xóa thành viên!"
                    });
                }

                // Kiểm tra thành viên cần xóa có tồn tại không
                const checkMemberQuery = `
                    SELECT role FROM "Group_Member"
                    WHERE group_id = $1 AND user_id = $2
                `;
                const memberResult = await pool.query(checkMemberQuery, [groupId, memberId]);
                console.log('Member check result:', memberResult.rows);

                if (memberResult.rows.length === 0) {
                    await pool.query('ROLLBACK');
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy thành viên trong nhóm!"
                    });
                }

                // Không cho phép xóa leader
                if (memberResult.rows[0].role === 'leader') {
                    await pool.query('ROLLBACK');
                    return res.status(403).json({
                        success: false,
                        message: "Không thể xóa leader khỏi nhóm!"
                    });
                }

                // Xóa thành viên từ Group_Member
                const deleteMemberQuery = `
                    DELETE FROM "Group_Member"
                    WHERE group_id = $1 AND user_id = $2
                `;
                await pool.query(deleteMemberQuery, [groupId, memberId]);

                // Kiểm tra xem còn thành viên nào trong nhóm không
                const countMembersQuery = `
                    SELECT COUNT(*) as member_count
                    FROM "Group_Member"
                    WHERE group_id = $1
                `;
                const countResult = await pool.query(countMembersQuery, [groupId]);
                const memberCount = parseInt(countResult.rows[0].member_count);

                // Nếu không còn thành viên nào, xóa luôn nhóm
                if (memberCount === 0) {
                    const deleteGroupQuery = `
                        DELETE FROM "Group"
                        WHERE group_id = $1
                    `;
                    await pool.query(deleteGroupQuery, [groupId]);
                }

                // Commit transaction
                await pool.query('COMMIT');

                res.status(200).json({
                    success: true,
                    message: memberCount === 0 
                        ? "Đã xóa thành viên và giải tán nhóm!"
                        : "Xóa thành viên thành công!"
                });

            } catch (error) {
                // Rollback nếu có lỗi
                await pool.query('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('Delete member error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi xóa thành viên!",
                error: error.message
            });
        }
    },

    getGroupTasks: async (req, res) => {
        try {
            const { groupId } = req.params;
            const user_id = req.user.user_id;

            // Kiểm tra quyền truy cập group
            const checkMemberQuery = `
                SELECT role FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2
            `;
            const memberResult = await pool.query(checkMemberQuery, [groupId, user_id]);
            
            if (memberResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền truy cập nhóm này!"
                });
            }

            const isLeader = memberResult.rows[0].role === 'leader';

            // Lấy danh sách task
            const query = `
                SELECT 
                    gt.task_id,
                    gt.group_task_name,
                    gt.task_description,
                    gt.status,
                    gt.creation_date,
                    gt.creation_time,
                    gt.date_begin,
                    gt.date_end,
                    gt.time_begin,
                    gt.time_end,
                    gt.user_id,
                    u.user_name
                FROM "Group_Task" gt
                LEFT JOIN "Users" u ON gt.user_id = u.user_id
                WHERE gt.group_id = $1
                ORDER BY gt.creation_date DESC, gt.creation_time DESC
            `;

            const result = await pool.query(query, [groupId]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách công việc thành công!",
                tasks: result.rows,
                isLeader
            });

        } catch (error) {
            console.error('Get group tasks error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách công việc!",
                error: error.message
            });
        }
    },

    createGroupTask: async (req, res) => {
        try {
            const { groupId } = req.params;
            const { taskName, description, dateBegin, dateEnd, timeBegin, timeEnd, userId } = req.body;
            const leader_id = req.user.user_id;
            const task_id = Math.floor(Math.random() * 1000000); // Tạo task_id ngẫu nhiên

            // Kiểm tra quyền leader
            const checkLeaderQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2 AND role = 'leader'
            `;
            const leaderResult = await pool.query(checkLeaderQuery, [groupId, leader_id]);
            
            if (leaderResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Chỉ leader mới có quyền tạo công việc!"
                });
            }

            // Kiểm tra member được assign có trong group không
            const checkMemberQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2
            `;
            const memberResult = await pool.query(checkMemberQuery, [groupId, userId]);
            
            if (memberResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Thành viên được chọn không thuộc nhóm!"
                });
            }

            // Tạo task mới với task_id ngẫu nhiên
            const createTaskQuery = `
                INSERT INTO "Group_Task" (
                    task_id,
                    group_task_name,
                    task_description,
                    status,
                    group_id,
                    user_id,
                    date_begin,
                    date_end,
                    time_begin,
                    time_end
                )
                VALUES ($1, $2, $3, 'PENDING', $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const result = await pool.query(createTaskQuery, [
                task_id,
                taskName,
                description,
                groupId,
                userId,
                dateBegin,
                dateEnd,
                timeBegin,
                timeEnd
            ]);

            // Lấy thêm thông tin user được assign
            const userQuery = `SELECT user_name FROM "Users" WHERE user_id = $1`;
            const userResult = await pool.query(userQuery, [userId]);

            const task = {
                ...result.rows[0],
                user_name: userResult.rows[0].user_name
            };

            res.status(201).json({
                success: true,
                message: "Tạo công việc thành công!",
                task
            });

        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi tạo công việc!",
                error: error.message
            });
        }
    },

    deleteGroupTasks: async (req, res) => {
        try {
            const { groupId } = req.params;
            const { taskIds } = req.body;
            const leader_id = req.user.user_id;

            // Kiểm tra quyền leader
            const checkLeaderQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2 AND role = 'leader'
            `;
            const leaderResult = await pool.query(checkLeaderQuery, [groupId, leader_id]);
            
            if (leaderResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Chỉ leader mới có quyền xóa công việc!"
                });
            }

            // Xóa các task
            const deleteTasksQuery = `
                DELETE FROM "Group_Task"
                WHERE task_id = ANY($1) AND group_id = $2
            `;
            await pool.query(deleteTasksQuery, [taskIds, groupId]);

            res.status(200).json({
                success: true,
                message: "Xóa công việc thành công!"
            });

        } catch (error) {
            console.error('Delete tasks error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi xóa công việc!",
                error: error.message
            });
        }
    }
};

module.exports = GroupController; 