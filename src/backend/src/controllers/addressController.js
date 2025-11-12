const addressService = require('../services/addressService');

const getAddresses = async (req, res) => {
    try {
        const addresses = await addressService.getAddressesService(req.userId);
        res.json(addresses);

    } catch (error) {
        const status = error.status || 500;
        console.error("Fetch addresses error:", error);
        res.status(status).json({ error: error.error || 'Failed to fetch addresses' });
    }
};

const updateAddresses = async (req, res) => {
    try {
        const { addresses } = req.body;
        
        const updatedAddresses = await addressService.updateAddressesService(req.userId, addresses);

        res.json(updatedAddresses);
    } catch (error) {
        const status = error.status || 500;
        console.error('Update addresses error:', error);
        res.status(status).json({ error: error.error || 'Failed to update addresses' });
    }
};

module.exports = { getAddresses, updateAddresses };