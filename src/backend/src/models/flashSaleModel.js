const { getConnection } = require('../db/connection');

const FlashSaleModel = {

  create: async (data) => {
    const { name, startTime, endTime, items } = data;
    const connection = getConnection(); 
    
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO flash_sales (name, startTime, endTime, status) VALUES (?, ?, ?, ?)',
        [name, startTime, endTime, 'PENDING'] 
      );
      const flashSaleId = result.insertId;

      if (items && items.length > 0) {
        const values = items.map(item => [flashSaleId, item.comicId, item.salePrice, item.quantityLimit]);
        await connection.query(
          'INSERT INTO flash_sale_items (flashSaleId, comicId, salePrice, quantityLimit) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      return flashSaleId;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  },

  getAll: async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT *, 
        CASE 
            WHEN NOW() BETWEEN startTime AND endTime THEN 'ACTIVE'
            WHEN NOW() < startTime THEN 'PENDING'
            ELSE 'ENDED'
        END as calculatedStatus
        FROM flash_sales 
        ORDER BY startTime DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const connection = getConnection();
    const [sale] = await connection.execute('SELECT * FROM flash_sales WHERE id = ?', [id]);
    if (sale.length === 0) return null;

    const [items] = await connection.execute(`
      SELECT fsi.*, c.title, c.coverImageUrl as coverImage, c.price as originalPrice 
      FROM flash_sale_items fsi
      JOIN comics c ON fsi.comicId = c.id
      WHERE fsi.flashSaleId = ?
    `, [id]);

    return { ...sale[0], items };
  },

  getActiveSale: async () => {
    const connection = getConnection();
    const now = new Date();
    
    const [rows] = await connection.execute(`
      SELECT * FROM flash_sales 
      WHERE startTime <= ? AND endTime >= ?
      ORDER BY endTime ASC 
      LIMIT 1
    `, [now, now]);

    if (rows.length === 0) return null;

    const activeSale = rows[0];
    
    const [items] = await connection.execute(`
      SELECT fsi.*, c.title, c.coverImageUrl as coverImage, c.price as originalPrice 
      FROM flash_sale_items fsi
      JOIN comics c ON fsi.comicId = c.id
      WHERE fsi.flashSaleId = ?
    `, [activeSale.id]);

    return { ...activeSale, items };
  },

  getActiveFlashSaleForComic: async (comicId) => {
    const connection = getConnection();
    const now = new Date();

    const query = `
      SELECT fsi.salePrice, fsi.quantityLimit, fsi.soldQuantity, fs.endTime, fs.name as saleName
      FROM flash_sale_items fsi
      JOIN flash_sales fs ON fsi.flashSaleId = fs.id
      WHERE fsi.comicId = ? 
      AND fs.status != 'ENDED'
      AND fs.startTime <= ? 
      AND fs.endTime >= ?
      LIMIT 1
    `;
    
    const [rows] = await connection.execute(query, [comicId, now, now]);
    return rows[0]; 
  },

  updateSold: async (comicId, quantity) => {
      const connection = getConnection();
      const query = `
          UPDATE flash_sale_items fsi
          JOIN flash_sales fs ON fsi.flashSaleId = fs.id
          SET fsi.soldQuantity = fsi.soldQuantity + ?
          WHERE fsi.comicId = ?
          AND fs.status != 'ENDED'
          AND fs.startTime <= NOW() 
          AND fs.endTime >= NOW()
      `;
      try {
          await connection.execute(query, [quantity, comicId]);
      } catch (error) {
          console.error("Lỗi cập nhật soldQuantity Flash Sale:", error);
      }
  },

  delete: async (id) => {
      const connection = getConnection();
      await connection.execute('DELETE FROM flash_sales WHERE id = ?', [id]);
  }
};

module.exports = FlashSaleModel;