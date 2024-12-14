const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db.config');

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

            // Kiểm tra và tạo Task_Type nếu chưa tồn tại
            const checkTaskTypeQuery = `
                SELECT * FROM "Task_Type" 
                WHERE task_type_id = $1 
                AND user_id = $2
            `;
            const taskTypeResult = await pool.query(checkTaskTypeQuery, [taskTypeId, user_id]);

            if (taskTypeResult.rows.length === 0) {
                const taskTypeNames = {
                    1: 'Học Tập',
                    2: 'Công Việc',
                    3: 'Gia Đình',
                    4: 'Hàng Ngày',
                    5: 'Hàng Tháng',
                    6: 'Hàng Năm'
                };

                const insertTaskTypeQuery = `
                    INSERT INTO "Task_Type" 
                    (task_type_id, task_type_name, description, user_id, priority)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `;

                await pool.query(insertTaskTypeQuery, [
                    taskTypeId,
                    taskTypeNames[taskTypeId],
                    `Danh sách công việc ${taskTypeNames[taskTypeId].toLowerCase()}`,
                    user_id,
                    taskTypeId
                ]);
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
            const { taskTypeId } = req.params;
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
                    TO_CHAR(ut.end_time, 'HH24:MI') as "timeEnd"
                FROM "User_Task" ut
                JOIN "Users" u ON ut.user_id = u.user_id
                WHERE ut.task_type_id = $1 
                AND ut.user_id = $2
                ORDER BY ut.date_created DESC, ut.time_created DESC
            `;

            const result = await pool.query(query, [taskTypeId, user_id]);

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
    }
};

module.exports = TaskController; 