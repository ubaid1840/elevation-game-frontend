const { Pool } = require('pg');

const pool = new Pool({
  connectionString : process.env.DATABASE_URL,
  
});

const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('Database query error:', err);
    throw err; 
  }
};

module.exports = {
  query,
};
