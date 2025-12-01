import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import '../../assets/styles/FlashSaleManagement.css'; // Import file CSS

// Sử dụng cổng 3000
const API_BASE_URL = 'http://localhost:3000/api';

interface Comic {
  id: number;
  title: string;
  price: number;
}

interface FlashSaleItemInput {
  comicId: number;
  salePrice: number;
  quantityLimit: number;
}

const FlashSaleManagement: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // State cho việc chọn sản phẩm
  const [allComics, setAllComics] = useState<Comic[]>([]);
  const [selectedItems, setSelectedItems] = useState<FlashSaleItemInput[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<Comic[]>([]);

  // Thêm token để xác thực admin khi gọi API
  const token = localStorage.getItem('storyverse_token');
  const config = {
      headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchSales();
    fetchComics();
  }, []);

  useEffect(() => {
      if(searchTerm) {
          setSearchResult(allComics.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())));
      } else {
          setSearchResult([]);
      }
  }, [searchTerm, allComics]);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/flash-sales`, config);
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComics = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/comics?limit=1000`); 
          setAllComics(Array.isArray(res.data) ? res.data : res.data.data);
      } catch (err) {
          console.error(err);
      }
  }

  const handleAddItem = (comic: Comic) => {
      if(selectedItems.find(i => i.comicId === comic.id)) return;
      setSelectedItems([...selectedItems, { comicId: comic.id, salePrice: Math.floor(comic.price * 0.8), quantityLimit: 10 }]);
      setSearchTerm('');
  };

  const updateItem = (index: number, field: keyof FlashSaleItemInput, value: number) => {
      const newItems = [...selectedItems];
      newItems[index] = { ...newItems[index], [field]: value };
      setSelectedItems(newItems);
  };

  const removeItem = (index: number) => {
      const newItems = [...selectedItems];
      newItems.splice(index, 1);
      setSelectedItems(newItems);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/flash-sales`, {
        name,
        startTime,
        endTime,
        items: selectedItems
      }, config);
      
      setIsCreating(false);
      fetchSales();
      // Reset form
      setName(''); setStartTime(''); setEndTime(''); setSelectedItems([]);
    } catch (err) {
      alert('Lỗi khi tạo Flash Sale. Kiểm tra quyền Admin.');
    }
  };

  const handleDelete = async (id: number) => {
      if(confirm('Bạn có chắc muốn xóa đợt sale này?')) {
          await axios.delete(`${API_BASE_URL}/flash-sales/${id}`, config);
          fetchSales();
      }
  }

  return (
    <div className="fs-mgmt-container">
      <div className="fs-mgmt-header">
        <h2>Quản lý Flash Sale</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="fs-btn-create"
        >
          <FaPlus className="mr-2" /> Tạo đợt Sale mới
        </button>
      </div>

      {isCreating && (
        <div className="fs-form-panel">
          <h3 className="text-xl font-bold mb-4">Thiết lập Flash Sale</h3>
          <form onSubmit={handleSubmit}>
            <div className="fs-form-group">
              <label className="fs-form-label">Tên chương trình</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required 
                     className="fs-form-input" placeholder="VD: Sale 12.12" />
            </div>
            <div className="grid grid-cols-2 gap-4 fs-form-group">
              <div>
                <label className="fs-form-label">Thời gian bắt đầu</label>
                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required 
                       className="fs-form-input" />
              </div>
              <div>
                <label className="fs-form-label">Thời gian kết thúc</label>
                <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required 
                       className="fs-form-input" />
              </div>
            </div>

            {/* Chọn sản phẩm */}
            <div className="relative fs-form-group">
                <label className="fs-form-label">Thêm sản phẩm</label>
                <div className="fs-search-box">
                    <FaSearch className="text-gray-400 mr-2"/>
                    <input 
                        type="text" 
                        placeholder="Tìm tên truyện..." 
                        className="bg-transparent outline-none w-full text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {searchTerm && searchResult.length > 0 && (
                    <div className="fs-search-dropdown">
                        {searchResult.map(comic => (
                            <div key={comic.id} onClick={() => handleAddItem(comic)}
                                 className="fs-search-item">
                                <span>{comic.title}</span>
                                <span>{comic.price?.toLocaleString()} đ</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Danh sách sản phẩm đã chọn */}
            {selectedItems.length > 0 && (
                <div className="fs-selected-items">
                    <h4 className="font-semibold mb-2">Sản phẩm tham gia:</h4>
                    <div className="space-y-2">
                        {selectedItems.map((item, index) => {
                            const comic = allComics.find(c => c.id === item.comicId);
                            return (
                                <div key={index} className="fs-item-row">
                                    <div className="fs-item-info font-medium">{comic?.title}</div>
                                    <div className="fs-item-input-group">
                                        <span className="text-xs text-gray-400">Giá gốc: {comic?.price}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm">Giá Sale:</span>
                                            <input type="number" value={item.salePrice} 
                                                   onChange={(e) => updateItem(index, 'salePrice', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="fs-item-input-group">
                                        <span className="text-xs text-gray-400">Số lượng</span>
                                        <input type="number" value={item.quantityLimit} 
                                               onChange={(e) => updateItem(index, 'quantityLimit', parseInt(e.target.value))} />
                                    </div>
                                    <button type="button" onClick={() => removeItem(index)} className="fs-btn-remove">
                                        <FaTrash />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <button type="submit" className="fs-btn-submit">
              Lưu Flash Sale
            </button>
          </form>
        </div>
      )}

      {/* Danh sách Flash Sale */}
      <div className="fs-list-grid">
        {sales.map(sale => (
          <div key={sale.id} className="fs-sale-card">
            <div>
              <h3 className="fs-sale-name">{sale.name}</h3>
              <p className="fs-sale-time">
                {new Date(sale.startTime).toLocaleString()} - {new Date(sale.endTime).toLocaleString()}
              </p>
              <p className="fs-status-badge">
                  {new Date(sale.startTime) > new Date() ? 'Sắp diễn ra' : 
                   (new Date(sale.endTime) < new Date() ? 'Đã kết thúc' : 'Đang diễn ra')}
              </p>
            </div>
            <button onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-400 p-2">
                <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSaleManagement;