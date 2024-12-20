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

            // Thêm leader vào nhóm với request = 'accepted'
            const addLeaderQuery = `
                INSERT INTO "Group_Member" (user_id, group_id, role, request)
                VALUES ($1, $2, 'leader', 'accepted')
            `;
            await pool.query(addLeaderQuery, [leader_id, group_id]);

            // Thêm các thành viên vào nhóm với request = 'accepted'
            if (members && members.length > 0) {
                const addMembersQuery = `
                    INSERT INTO "Group_Member" (user_id, group_id, role, request)
                    VALUES ($1, $2, 'member', 'accepted')
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

            // Lấy danh sách thành viên chỉ những người đã được chấp nhận
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
                AND gm.request = 'accepted'
                ORDER BY 
                    CASE WHEN gm.role = 'leader' THEN 0 ELSE 1 END,
                    gm.date_join DESC, 
                    gm.time_join DESC
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

            // Kiểm tra user đã trong nhóm chưa
            const checkMemberQuery = `
                SELECT * FROM "Group_Member" 
                WHERE group_id = $1 AND user_id = $2
            `;
            const memberExists = await pool.query(checkMemberQuery, [groupId, userId]);

            if (memberExists.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Thành viên đã ở trong nhóm!"
                });
            }

            // Thêm thành viên mới với trạng thái accepted
            const addMemberQuery = `
                INSERT INTO "Group_Member" (user_id, group_id, role, request)
                VALUES ($1, $2, 'member', 'accepted')
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
                WHERE group_id = $1 AND user_id = $2 AND request = 'accepted'
            `;
            const memberResult = await pool.query(checkMemberQuery, [groupId, userId]);
            
            if (memberResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Thành viên được chọn không thuộc nhóm hoặc chưa được chấp nhận!"
                });
            }

            // Tạo task mới
            const task_id = Math.floor(Math.random() * 1000000).toString();
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
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;

            const result = await pool.query(createTaskQuery, [
                task_id,
                taskName,
                description,
                'PENDING',
                groupId,
                userId,
                dateBegin,
                dateEnd,
                timeBegin,
                timeEnd
            ]);

            // Lấy thông tin user được assign
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
    },

    updateGroupTask: async (req, res) => {
        try {
            const { groupId, taskId } = req.params;
            const { taskName, description, dateBegin, dateEnd, timeBegin, timeEnd, userId } = req.body;
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
                    message: "Chỉ leader mới có quyền cập nhật công việc!"
                });
            }

            // Kiểm tra member được assign có trong group không
            const checkMemberQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2 AND request = 'accepted'
            `;
            const memberResult = await pool.query(checkMemberQuery, [groupId, userId]);
            
            if (memberResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Thành viên được chọn không thuộc nhóm hoặc chưa được chấp nhận!"
                });
            }

            // Cập nhật thông tin task
            const updateTaskQuery = `
                UPDATE "Group_Task"
                SET 
                    group_task_name = $1,
                    task_description = $2,
                    user_id = $3,
                    date_begin = $4,
                    date_end = $5,
                    time_begin = $6,
                    time_end = $7
                WHERE task_id = $8 AND group_id = $9
                RETURNING *
            `;

            const result = await pool.query(updateTaskQuery, [
                taskName,
                description,
                userId,
                dateBegin,
                dateEnd,
                timeBegin,
                timeEnd,
                taskId,
                groupId
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy công việc cần cập nhật!"
                });
            }

            // Lấy thông tin user được assign
            const userQuery = `SELECT user_name FROM "Users" WHERE user_id = $1`;
            const userResult = await pool.query(userQuery, [userId]);

            const task = {
                ...result.rows[0],
                user_name: userResult.rows[0].user_name
            };

            res.status(200).json({
                success: true,
                message: "Cập nhật công việc thành công!",
                task
            });

        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi cập nhật công việc!",
                error: error.message
            });
        }
    },

    getGroupRequests: async (req, res) => {
        try {
            const { groupId } = req.params;
            const user_id = req.user.user_id;

            // Kiểm tra người dùng có phải leader không
            const checkLeaderQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2 AND role = 'leader'
            `;
            const leaderResult = await pool.query(checkLeaderQuery, [groupId, user_id]);
            
            if (leaderResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Chỉ leader mới có quyền xem danh sách yêu cầu!"
                });
            }

            // Lấy danh sách yêu cầu
            const requestsQuery = `
                SELECT u.user_id, u.user_name, gm.date_join, gm.time_join
                FROM "Group_Member" gm
                JOIN "Users" u ON gm.user_id = u.user_id
                WHERE gm.group_id = $1 AND gm.request = 'waiting'
            `;
            const result = await pool.query(requestsQuery, [groupId]);

            res.status(200).json({
                success: true,
                requests: result.rows
            });

        } catch (error) {
            console.error('Get group requests error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách yêu cầu!",
                error: error.message
            });
        }
    },

    requestJoinGroup: async (req, res) => {
        try {
            const { groupId } = req.params;
            const user_id = req.user.user_id;

            // Kiểm tra group tồn tại
            const checkGroupQuery = `SELECT * FROM "Group" WHERE group_id = $1`;
            const groupExists = await pool.query(checkGroupQuery, [groupId]);
            
            if (groupExists.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhóm!"
                });
            }

            // Kiểm tra user đã trong nhóm chưa
            const checkMemberQuery = `
                SELECT * FROM "Group_Member"
                WHERE group_id = $1 AND user_id = $2
            `;
            const memberExists = await pool.query(checkMemberQuery, [groupId, user_id]);
            
            if (memberExists.rows.length > 0) {
                if (memberExists.rows[0].request === 'waiting') {
                    return res.status(400).json({
                        success: false,
                        message: "Bạn đã gửi yêu cầu vào nhóm này rồi!"
                    });
                } else if (memberExists.rows[0].request === 'accepted') {
                    return res.status(400).json({
                        success: false,
                        message: "Bạn đã là thành viên của nhóm này rồi!"
                    });
                }
            }

            // Thêm yêu cầu vào nhóm
            const addRequestQuery = `
                INSERT INTO "Group_Member" (user_id, group_id, role, request)
                VALUES ($1, $2, 'member', 'waiting')
                RETURNING *
            `;
            await pool.query(addRequestQuery, [user_id, groupId]);

            res.status(200).json({
                success: true,
                message: "Đã gửi yêu cầu tham gia nhóm!"
            });

        } catch (error) {
            console.error('Request join group error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi gửi yêu cầu tham gia nhóm!",
                error: error.message
            });
        }
    },

    handleJoinRequest: async (req, res) => {
        try {
            const { groupId, userId } = req.params;
            const { action } = req.body;
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
                    message: "Chỉ leader mới có quyền xử lý yêu cầu!"
                });
            }

            if (action === 'accept') {
                const acceptQuery = `
                    UPDATE "Group_Member"
                    SET request = 'accepted'
                    WHERE group_id = $1 AND user_id = $2
                    RETURNING *
                `;
                await pool.query(acceptQuery, [groupId, userId]);
            } else {
                const rejectQuery = `
                    DELETE FROM "Group_Member"
                    WHERE group_id = $1 AND user_id = $2 AND request = 'waiting'
                `;
                await pool.query(rejectQuery, [groupId, userId]);
            }

            res.status(200).json({
                success: true,
                message: action === 'accept' ? "Đã chấp nhận yêu cầu!" : "Đã từ chối yêu cầu!"
            });

        } catch (error) {
            console.error('Handle join request error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi xử lý yêu cầu!",
                error: error.message
            });
        }
    },

    deleteGroup: async (req, res) => {
        try {
            const { groupId } = req.params;
            const leader_id = req.user.user_id;

            // Bắt đầu transaction
            await pool.query('BEGIN');

            try {
                // Kiểm tra quyền leader
                const checkLeaderQuery = `
                    SELECT * FROM "Group_Member"
                    WHERE group_id = $1 AND user_id = $2 AND role = 'leader'
                `;
                const leaderResult = await pool.query(checkLeaderQuery, [groupId, leader_id]);
                
                if (leaderResult.rows.length === 0) {
                    await pool.query('ROLLBACK');
                    return res.status(403).json({
                        success: false,
                        message: "Chỉ leader mới có quyền xóa nhóm!"
                    });
                }

                // Xóa theo thứ tự
                // 1. Xóa Group_Task
                await pool.query('DELETE FROM "Group_Task" WHERE group_id = $1', [groupId]);
                
                // 2. Xóa Group_Member
                await pool.query('DELETE FROM "Group_Member" WHERE group_id = $1', [groupId]);
                
                // 3. Cuối cùng xóa Group
                const deleteGroupQuery = `
                    DELETE FROM "Group"
                    WHERE group_id = $1
                    RETURNING *
                `;
                const result = await pool.query(deleteGroupQuery, [groupId]);

                if (result.rows.length === 0) {
                    await pool.query('ROLLBACK');
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nhóm!"
                    });
                }

                await pool.query('COMMIT');

                res.status(200).json({
                    success: true,
                    message: "Xóa nhóm thành công!"
                });

            } catch (error) {
                await pool.query('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('Delete group error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi xóa nhóm!",
                error: error.message
            });
        }
    }
};

module.exports = GroupController; 