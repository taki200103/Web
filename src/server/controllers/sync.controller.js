const pool = require('../config/db.config');

const SyncController = {
    syncUserTaskToGroupTask: async (req, res) => {
        try {
            const { task_uid, group_id } = req.body;
            const user_id = req.user.user_id;

            // Kiểm tra xem người dùng có phải là thành viên của nhóm không
            const checkMembershipQuery = `
                SELECT * FROM "Group_Member" 
                WHERE user_id = $1 AND group_id = $2
            `;
            const membershipResult = await pool.query(checkMembershipQuery, [user_id, group_id]);

            if (membershipResult.rows.length === 0) {
                return res.status(403).json({
                    message: "Bạn không phải là thành viên của nhóm này!"
                });
            }

            // Lấy thông tin của User Task
            const getUserTaskQuery = `
                SELECT * FROM "User_Task"
                WHERE task_uid = $1 AND user_id = $2
            `;
            const userTaskResult = await pool.query(getUserTaskQuery, [task_uid, user_id]);

            if (userTaskResult.rows.length === 0) {
                return res.status(404).json({
                    message: "Không tìm thấy công việc cá nhân!"
                });
            }

            const userTask = userTaskResult.rows[0];

            // Tạo Group Task mới
            const createGroupTaskQuery = `
                INSERT INTO "Group_Task" 
                (group_task_name, task_description, status, group_id, user_id, date_begin, date_end, time_begin, time_end)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING task_id
            `;
            const groupTaskResult = await pool.query(createGroupTaskQuery, [
                userTask.task_uname,
                userTask.description,
                userTask.status,
                group_id,
                user_id,
                userTask.date_begin,
                userTask.date_end,
                userTask.start_time,
                userTask.end_time
            ]);

            const groupTaskId = groupTaskResult.rows[0].task_id;

            res.status(200).json({
                message: "Công việc đã được đồng bộ với nhóm thành công!",
                groupTaskId: groupTaskId
            });

        } catch (error) {
            console.error('Sync task error:', error);
            res.status(500).json({
                message: "Lỗi khi đồng bộ công việc với nhóm!",
                error: error.message
            });
        }
    },
};

module.exports = SyncController;