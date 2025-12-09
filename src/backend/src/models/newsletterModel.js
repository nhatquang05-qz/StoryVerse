const { getConnection } = require('../db/connection');

const newsletterModel = {
     
    addSubscriber: async (email) => {
        const connection = getConnection();
         
        const [result] = await connection.execute(
            'INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)',
            [email]
        );
        return result;
    },

     
    getAllSubscribers: async () => {
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT email FROM newsletter_subscribers WHERE isActive = 1'
        );
        return rows;
    },
    
     
    checkEmail: async (email) => {
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT id FROM newsletter_subscribers WHERE email = ?', 
            [email]
        );
        return rows.length > 0;
    }
};

module.exports = newsletterModel;