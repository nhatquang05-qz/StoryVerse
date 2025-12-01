const { getConnection } = require('../db/connection');

const FlashSaleModel = {
  // Tạo đợt sale mới
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
        // Chuẩn bị values cho bulk insert
        const values = items.map(item => [flashSaleId, item.comicId, item.salePrice, item.quantityLimit]);
        
        // Sử dụng query cho bulk insert
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

  // Lấy tất cả đợt sale (cho Admin)
  getAll: async () => {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM flash_sales ORDER BY startTime DESC');
    return rows;
  },

  // Lấy chi tiết đợt sale (kèm items)
  getById: async (id) => {
    const connection = getConnection();
    const [sale] = await connection.execute('SELECT * FROM flash_sales WHERE id = ?', [id]);
    if (sale.length === 0) return null;

    // SỬA: Đổi c.coverImage thành c.coverImageUrl
    const [items] = await connection.execute(`
      SELECT fsi.*, c.title, c.coverImageUrl as coverImage, c.price as originalPrice 
      FROM flash_sale_items fsi
      JOIN comics c ON fsi.comicId = c.id
      WHERE fsi.flashSaleId = ?
    `, [id]);

    return { ...sale[0], items };
  },

  // Lấy đợt sale đang hoạt động (cho Homepage)
  getActiveSale: async () => {
    const connection = getConnection();
    const now = new Date();
    
    const [rows] = await connection.execute(`
      SELECT * FROM flash_sales 
      WHERE (startTime <= ? AND endTime >= ?) OR (startTime > ?)
      ORDER BY startTime ASC 
      LIMIT 1
    `, [now, now, now]);

    if (rows.length === 0) return null;

    const activeSale = rows[0];
    
    // SỬA: Đổi c.coverImage thành c.coverImageUrl
    const [items] = await connection.execute(`
      SELECT fsi.*, c.title, c.coverImageUrl as coverImage, c.price as originalPrice 
      FROM flash_sale_items fsi
      JOIN comics c ON fsi.comicId = c.id
      WHERE fsi.flashSaleId = ?
    `, [activeSale.id]);

    return { ...activeSale, items };
  },
  
  // Xóa đợt sale
  delete: async (id) => {
      const connection = getConnection();
      await connection.execute('DELETE FROM flash_sales WHERE id = ?', [id]);
  }
};

module.exports = FlashSaleModel;