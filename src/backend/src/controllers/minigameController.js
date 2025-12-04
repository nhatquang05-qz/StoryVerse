const service = require('../services/christmasService');

exports.spin = async (req, res) => {
    try {
        const result = await service.spinWheel(req.userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.postWish = async (req, res) => {
    try {
        if(!req.body.content) return res.status(400).json({message: "Nội dung trống"});
        
        const result = await service.addWish(req.userId, req.body.content);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getWishList = async (req, res) => {
    try {
        const list = await service.getWishes();
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};