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

    const normalizedAddresses = addresses.map(addr => {
        const newAddr = { ...addr };
        
        if (!newAddr.specificAddress && newAddr.street) {
            newAddr.specificAddress = newAddr.street;
        }
        
        delete newAddr.street;
        
        return newAddr;
    });

    for(const addr of normalizedAddresses) {
        if (!addr || typeof addr.specificAddress !== 'string' || typeof addr.city !== 'string') {
             console.error("Address validation failed:", addr);
             throw { status: 400, error: 'Một hoặc nhiều địa chỉ không hợp lệ (Thiếu tên đường hoặc thành phố).' };
        }
    }
    
    const addressesJson = JSON.stringify(normalizedAddresses);
    await addressModel.updateAddressesRaw(userId, addressesJson);

    return normalizedAddresses;
};

module.exports = { getAddressesService, updateAddressesService };