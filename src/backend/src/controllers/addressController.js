const { getConnection } = require('../db/connection');
const ensureUserDataTypes = require('../utils/ensureUserDataTypes');

const getAddresses = async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT addresses FROM users WHERE id = ?',
            [req.userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const addresses = ensureUserDataTypes({ addresses: rows[0].addresses }).addresses;
        res.json(addresses);

    } catch (error) {
        console.error("Fetch addresses error:", error);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
};

const updateAddresses = async (req, res) => {
    try {
        const { addresses } = req.body;
        if (!Array.isArray(addresses)) {
            return res.status(400).json({ error: 'Invalid data format, expected an array of addresses.' });
        }
        for(const addr of addresses) {
            if (!addr || typeof addr.street !== 'string' || typeof addr.city !== 'string') {
                 return res.status(400).json({ error: 'Một hoặc nhiều địa chỉ không hợp lệ.' });
            }
        }

        const connection = getConnection();
        await connection.execute(
            'UPDATE users SET addresses = ? WHERE id = ?',
            [JSON.stringify(addresses), req.userId]
        );

        res.json(addresses);
    } catch (error) {
        console.error('Update addresses error:', error);
        res.status(500).json({ error: 'Failed to update addresses' });
    }
};

module.exports = { getAddresses, updateAddresses };