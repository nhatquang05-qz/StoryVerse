const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

let connection;

const connectDB = async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

const getConnection = () => {
    if (!connection) {
        throw new Error('Database connection has not been established.');
    }
    return connection;
};

const closeDB = async () => {
    if (connection) {
        try {
            await connection.end();
            console.log('Database connection closed.');
        } catch(err) {
            console.error("Error closing DB connection:", err);
        }
    }
};

module.exports = { connectDB, getConnection, closeDB };