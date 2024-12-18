const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const searchTasks = async (userId, searchTerm) => {
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
    FROM "User_Task" ut
    JOIN "Users" u ON ut.user_id = u.user_id
    JOIN "Task_Type" tt ON ut.task_type_id = tt.task_type_id
    WHERE ut.user_id = $1 
    AND LOWER(ut.task_uname) LIKE LOWER($2)
    ORDER BY ut.date_created DESC, ut.time_created DESC
  `;

  const result = await pool.query(query, [userId, `%${searchTerm}%`]);
  return result.rows;
};

module.exports = searchTasks; 