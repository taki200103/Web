const pool = require('../config/db.config');

const taskTypes = {
    1: 'Học Tập',
    2: 'Công Việc',
    3: 'Gia Đình',
    4: 'Hàng Ngày',
    5: 'Hàng Tháng',
    6: 'Hàng Năm'
};

const UserTasksController = {
    getUserTasks: async (req, res) => {
        try {
            const userId = req.user.id;

            const query = `
                SELECT 
                    u.user_id, 
                    u.user_name, 
                    u.email, 
                    ut.task_uname, 
                    ut.description AS task_description, 
                    ut.date_begin, 
                    ut.date_end, 
                    ut.status,
                    ut.task_type_id,
                    TO_CHAR(ut.date_created, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.time_created, 'HH24:MI:SS') as "createdAt",
                    TO_CHAR(ut.date_begin, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.start_time, 'HH24:MI') as "timeStart",
                    TO_CHAR(ut.date_end, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.end_time, 'HH24:MI') as "timeEnd"
                FROM 
                    "Users" u
                JOIN 
                    "User_Task" ut ON u.user_id = ut.user_id
                WHERE u.user_id = $1
                ORDER BY ut.date_created DESC, ut.time_created DESC
            `;

            const result = await pool.query(query, [userId]);
            
            // Thêm tên loại công việc và kết hợp với status
            const tasksWithTypeName = result.rows.map(task => ({
                ...task,
                taskType: taskTypes[task.task_type_id] || 'Unknown',
                status: `${taskTypes[task.task_type_id]} - ${task.status}`
            }));

            res.json(tasksWithTypeName);
        } catch (error) {
            console.error('Error getting user tasks:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getTasksByType: async (req, res) => {
        try {
            const { taskTypeId } = req.params;
            const user_id = req.user.user_id;

            const query = `
                SELECT 
                    u.user_id, 
                    u.user_name, 
                    u.email, 
                    ut.task_uname, 
                    ut.description AS task_description, 
                    ut.date_begin, 
                    ut.date_end, 
                    ut.status,
                    ut.task_type_id,
                    TO_CHAR(ut.date_begin, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.start_time, 'HH24:MI') as "timeStart",
                    TO_CHAR(ut.date_end, 'DD/MM/YYYY') || ' ' || 
                    TO_CHAR(ut.end_time, 'HH24:MI') as "timeEnd"
                FROM 
                    "Users" u
                JOIN 
                    "User_Task" ut ON u.user_id = ut.user_id
                WHERE u.user_id = $1 AND ut.task_type_id = $2
                ORDER BY ut.date_begin, ut.start_time
            `;

            const result = await pool.query(query, [user_id, taskTypeId]);

            // Thêm tên loại công việc và kết hợp với status
            const tasksWithTypeName = result.rows.map(task => ({
                ...task,
                taskType: taskTypes[task.task_type_id] || 'Unknown',
                status: `${taskTypes[task.task_type_id]} - ${task.status}`
            }));

            res.status(200).json({
                success: true,
                tasks: tasksWithTypeName
            });

        } catch (error) {
            console.error('Get tasks by type error:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách công việc!",
                error: error.message
            });
        }
    }
};

module.exports = UserTasksController;