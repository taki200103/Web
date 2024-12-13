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
            const task_uid = uuidv4().substring(0, 8);

            // Kiểm tra và tạo Task_Type nếu chưa tồn tại
            const checkTaskTypeQuery = `
                SELECT * FROM "Task_Type" 
                WHERE task_type_id = $1 
                AND user_id = $2
            `;
            const taskTypeResult = await pool.query(checkTaskTypeQuery, [taskTypeId, user_id]);

            if (taskTypeResult.rows.length === 0) {
                // Map task type names
                const taskTypeNames = {
                    1: 'Học Tập',
                    2: 'Công Việc',
                    3: 'Gia Đình',
                    4: 'Hàng Ngày',
                    5: 'Hàng Tháng',
                    6: 'Hàng Năm'
                };

                // Tạo task type mới
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
                    taskTypeId // priority giống với task_type_id
                ]);
            }

            // Thêm task mới vào User_Task với date_begin và date_end
            const insertTaskQuery = `
                INSERT INTO "User_Task" 
                (task_uid, task_uname, description, date_begin, date_end, 
                start_time, end_time, task_type_id, user_id, status)
                VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, $8, $9, $10)
                RETURNING *
            `;

            const values = [
                task_uid,
                taskName,
                description,
                dateBegin,    // date_begin
                dateEnd,      // date_end
                timeBegin,    // start_time
                timeEnd,      // end_time
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
    }
};

module.exports = TaskController; 