const { getConnection } = require('../db/connection');

const createContact = async ({ name, email, subject, message }) => {
    const connection = getConnection();
    const query = `
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [
        name,
        email,
        subject || null, 
        message
    ]);
    return result;
};

module.exports = { createContact };