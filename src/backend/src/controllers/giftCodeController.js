const GiftCode = require('../models/giftcodeModel');
const { getConnection } = require('../db/connection');

const redeemGiftCode = async (req, res) => {
  const { code } = req.body;
  const userId = req.userId;
  
  try {
    const giftCode = await GiftCode.findByCode(code);

    if (!giftCode) {
      return res.status(404).json({ success: false, message: 'Mã quà tặng không tồn tại hoặc đã bị khóa.' });
    }

    if (giftCode.expiryDate && new Date(giftCode.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Mã quà tặng đã hết hạn.' });
    }

    if (giftCode.usageLimit > 0 && giftCode.usedCount >= giftCode.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã quà tặng đã hết lượt sử dụng.' });
    }

    const isUsed = await GiftCode.checkUsage(userId, giftCode.id);
    if (isUsed) {
      return res.status(400).json({ success: false, message: 'Bạn đã sử dụng mã này rồi.' });
    }

    const connection = await getConnection();
    await connection.beginTransaction();

    try {
      await GiftCode.recordUsage(userId, giftCode.id, connection);
      await GiftCode.incrementUsedCount(giftCode.id, connection);

      if (giftCode.coinReward > 0 || giftCode.expReward > 0) {
        await GiftCode.updateUserRewards(userId, giftCode.coinReward, giftCode.expReward, connection);
      }

      if (giftCode.voucherId) {
        await GiftCode.addVoucherToUser(userId, giftCode.voucherId, connection);
      }

      await connection.commit();

      let rewardsText = [];
      if (giftCode.coinReward > 0) rewardsText.push(`${giftCode.coinReward} Xu`);
      if (giftCode.expReward > 0) rewardsText.push(`${giftCode.expReward} EXP`);
      if (giftCode.voucherId) rewardsText.push(`Voucher`);

      res.status(200).json({ 
        success: true, 
        message: `Đổi mã thành công! Bạn nhận được: ${rewardsText.join(', ')}`,
        rewards: {
            coin: giftCode.coinReward,
            exp: giftCode.expReward,
            voucherId: giftCode.voucherId
        }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xử lý mã quà tặng.' });
  }
};

module.exports = { redeemGiftCode };