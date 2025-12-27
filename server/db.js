import mysql2 from 'mysql2/promise';


const db = mysql2.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'haslodobazy',
  database: 'WWWW25_WODCZYNSKI',
  port: 3306,
  dateStrings: true
});

export default db;