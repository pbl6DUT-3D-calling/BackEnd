// 1. Import lớp Pool từ thư viện pg
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',          
  host: 'localhost',         
  database: 'PBL6_Final',  
  password: '12345678', 
  port: 5432,              
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};