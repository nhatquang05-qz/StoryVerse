const generateTransactionCode = (prefix, id) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g,"");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${dateStr}${id}${randomSuffix}`;
};
module.exports = { generateTransactionCode };