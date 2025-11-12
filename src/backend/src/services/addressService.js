const addressModel = require('../models/addressModel');
const ensureUserDataTypes = require('../utils/ensureUserDataTypes');

const getAddressesService = async (userId) => {
    const userAddressData = await addressModel.findUserAddressesRaw(userId);
    
    if (!userAddressData) {
        throw { status: 404, error: 'User not found' }; 
    }

    const addresses = ensureUserDataTypes({ addresses: userAddressData.addresses }).addresses;
    return addresses;
};

const updateAddressesService = async (userId, addresses) => {
    if (!Array.isArray(addresses)) {
        throw { status: 400, error: 'Invalid data format, expected an array of addresses.' };
    }
    for(const addr of addresses) {
        if (!addr || typeof addr.street !== 'string' || typeof addr.city !== 'string') {
             throw { status: 400, error: 'Một hoặc nhiều địa chỉ không hợp lệ.' };
        }
    }
    
    const addressesJson = JSON.stringify(addresses);
    await addressModel.updateAddressesRaw(userId, addressesJson);

    return addresses;
};

module.exports = { getAddressesService, updateAddressesService };