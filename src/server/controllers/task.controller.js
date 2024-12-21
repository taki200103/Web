const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db.config');
const searchTasks = require('../utils/searchTasks');

const TaskController = {
    createTask: async (req, res) => {
        try {
            const { 
                taskName, 
                description, 
                timeBegin, 
                timeEnd, 
                dateBegin,
                dateEnd,
                taskTypeId
            } = req.body;
            
            const user_id = req.user.user_id;

            // Kiểm tra user tồn tại
            const checkUserQuery = `SELECT * FROM "Users" WHERE user_id = $1`;
            const userExists = await pool.query(checkUserQuery, [user_id]);
            
            if (userExists.rows.length === 0) {
                return res.status(404).json({
                    message: "Không tìm thấy người dùng!"
                });
            }

            const task_uid = uuidv4().substring(0, 8);

            // Thêm task mới với date_created và time_created mặc định
            const insertTaskQuery = `
                INSERT INTO "User_Task" 
                (task_uid, task_uname, description, 
                date_begin, date_end, start_time, end_time,
                task_type_id, user_id, status)
                VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, 
                $8, $9, $10)
                RETURNING *
            `;

            const values = [
                task_uid,
                taskName,
                description,
                dateBegin,
                dateEnd,
                timeBegin,
                timeEnd,
                taskTypeId,
                user_id,
                'PENDING'
            ];

            const result = await pool.query(insertTaskQuery, values);

            // Lấy thông tin user để trả về
            const userQuery = `SELECT user_name FROM "Users" WHERE user_id = $1`;
            const userResult = await pool.query(userQuery, [user_id]);

            res.status(201).json({
                message: "Tạo công việc mới thành công!",
                task: {
                    ...result.rows[0],
                    createdBy: userResult.rows[0].user_name
                }
            });

        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                message: "Lỗi khi tạo công việc mới!",
                error: error.message
            });
        }
    },

    getTasksByType: async (req, res) => {
        try {
            const { taskTypeId } = req.params;  // taskTypeId sẽ trùng với priority
            const user_id = req.user.user_id;

            const query = `
                SELECT 
                    ut.task_uid as id,
                    ut.task_uname as task,
                    ut.description,
                    ut.status,
                    u.user_name as "createdBy",
                    TO_CHAR(ut.date_created, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.time_created, 'HH24:MI:SS') as "createdAt",
                    TO_CHAR(ut.date_begin, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.start_time, 'HH24:MI') as "timeStart",
                    TO_CHAR(ut.date_end, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.end_time, 'HH24:MI') as "timeEnd",
                    tt.task_type_name as "taskType"
                FROM "Users" u
                JOIN "User_Task" ut ON u.user_id = ut.user_id
                JOIN "Task_Type" tt ON ut.task_type_id = tt.task_type_id
                WHERE u.user_id = $1 
                AND tt.priority = $2
                ORDER BY ut.date_created DESC, ut.time_created DESC
            `;

            // Log để debug
            console.log('Executing query with:', {
                user_id,
                taskTypeId,
                query
            });

            const result = await pool.query(query, [user_id, taskTypeId]);

            console.log('Query result:', result.rows);

            res.status(200).json({
                message: "Lấy danh sách công việc thành công!",
                tasks: result.rows
            });

        } catch (error) {
            console.error('Get tasks error:', error);
            res.status(500).json({
                message: "Lỗi khi lấy danh sách công việc!",
                error: error.message
            });
        }
    },

    deleteTask: async (req, res) => {
        try {
            const { taskIds } = req.body; // Nhận mảng các task_uid cần xóa
            const user_id = req.user.user_id;

            // Kiểm tra quyền sở hữu các task trước khi xóa
            const checkOwnershipQuery = `
                SELECT task_uid 
                FROM "User_Task" 
                WHERE task_uid = ANY($1) 
                AND user_id = $2
            `;
            const ownershipResult = await pool.query(checkOwnershipQuery, [taskIds, user_id]);

            if (ownershipResult.rows.length !== taskIds.length) {
                return res.status(403).json({
                    message: "Bạn không có quyền xóa một số công việc đã chọn!"
                });
            }

            // Thực hiện xóa các task
            const deleteQuery = `
                DELETE FROM "User_Task"
                WHERE task_uid = ANY($1)
                AND user_id = $2
                RETURNING task_uid
            `;

            const result = await pool.query(deleteQuery, [taskIds, user_id]);

            res.status(200).json({
                message: "Xóa công việc thành công!",
                deletedTasks: result.rows.map(row => row.task_uid)
            });

        } catch (error) {
            console.error('Delete tasks error:', error);
            res.status(500).json({
                message: "Lỗi khi xóa công việc!",
                error: error.message
            });
        }
    },

    updateTask: async (req, res) => {
        try {
            const { taskId } = req.params;
            const { 
                taskName, 
                description, 
                timeBegin, 
                timeEnd, 
                dateBegin, 
                dateEnd,
                status 
            } = req.body;
            const user_id = req.user.user_id;

            // Kiểm tra quyền sở hữu task
            const checkOwnershipQuery = `
                SELECT * FROM "User_Task"
                WHERE task_uid = $1 AND user_id = $2
            `;
            const ownershipResult = await pool.query(checkOwnershipQuery, [taskId, user_id]);

            if (ownershipResult.rows.length === 0) {
                return res.status(403).json({
                    message: "Bạn không có quyền chỉnh sửa công việc này!"
                });
            }

            // Cập nhật task
            const updateQuery = `
                UPDATE "User_Task"
                SET 
                    task_uname = $1,
                    description = $2,
                    date_begin = $3,
                    date_end = $4,
                    start_time = $5::time,
                    end_time = $6::time,
                    status = $7
                WHERE task_uid = $8 AND user_id = $9
                RETURNING *
            `;

            const result = await pool.query(updateQuery, [
                taskName,
                description,
                dateBegin,
                dateEnd,
                timeBegin,
                timeEnd,
                status,
                taskId,
                user_id
            ]);

            // Lấy thông tin user
            const userQuery = `SELECT user_name FROM "Users" WHERE user_id = $1`;
            const userResult = await pool.query(userQuery, [user_id]);

            res.status(200).json({
                message: "Cập nhật công việc thành công!",
                task: {
                    ...result.rows[0],
                    createdBy: userResult.rows[0].user_name
                }
            });

        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({
                message: "Lỗi khi cập nhật công việc!",
                error: error.message
            });
        }
    },

    getTaskTypeName: (taskTypeId) => {
        console.log('Task Type ID:', taskTypeId); // Log taskTypeId
        const item = items.find(item => item.id === taskTypeId);
        return item ? item.name : 'Unknown';
    },

    searchTasks: async (req, res) => {
        try {
            const { searchTerm } = req.query;
            const user_id = req.user.user_id;

            const tasks = await searchTasks(user_id, searchTerm);

            res.status(200).json({
                success: true,
                tasks,
            });
        } catch (error) {
            console.error('Search tasks error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi tìm kiếm công việc!",
                error: error.message,
            });
        }
    }
};

module.exports = TaskController; 