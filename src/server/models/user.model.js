const pool = require('../config/db.config');

const User = {
    create: async (userData) => {
        const { user_id, user_name, email, password } = userData;
        const query = `
            INSERT INTO "Users" (user_id, user_name, email, password)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [user_id, user_name, email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    findByUsername: async (username) => {
        const query = `SELECT * FROM "Users" WHERE user_name = $1`;
        const result = await pool.query(query, [username]);
        return result.rows[0];
    },

    findByEmail: async (email) => {
        const query = `SELECT * FROM "Users" WHERE email = $1`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    query: async (query, values) => {
        const result = await pool.query(query, values);
        return result;
    }
};

module.exports = User; 