const { Pool } = require('pg');

const pool = new Pool({
    user: 'shop_admin',           
    host: 'localhost',          
    database: 'auto_shop', 
    password: '13513567', 
    port: 5432,             
    database: 'auto_shop'    
});

module.exports = pool;
