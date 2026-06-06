import React from 'react';
import { FiSearch } from 'react-icons/fi';

export type SortOrder = 'newest' | 'oldest' | 'title-az' | 'title-za';

interface AdminFilterBarProps {
	searchTerm: string;
	onSearchChange: (term: string) => void;
	statusFilter: string;
	onStatusChange: (status: string) => void;
	sortOrder: SortOrder;
	onSortChange: (order: SortOrder) => void;
}

const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
	searchTerm,
	onSearchChange,
	statusFilter,
	onStatusChange,
	sortOrder,
	onSortChange,
}) => {
	return (
		<div className="admin-filter-bar">
			<div className="filter-group search-bar">
				<FiSearch />
				<input
					type="text"
					placeholder="Tìm theo tên truyện..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>
			<div className="filter-group">
				<label>Trạng thái:</label>
				<select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
					<option value="all">Tất cả</option>
					<option value="Ongoing">Ongoing</option>
					<option value="Completed">Completed</option>
					<option value="Dropped">Dropped</option>
				</select>
			</div>
			<div className="filter-group">
				<label>Sắp xếp:</label>
				<select
					value={sortOrder}
					onChange={(e) => onSortChange(e.target.value as SortOrder)}
				>
					<option value="newest">Mới nhất</option>
					<option value="oldest">Cũ nhất</option>
					<option value="title-az">Tên A-Z</option>
					<option value="title-za">Tên Z-A</option>
				</select>
			</div>
		</div>
	);
};

export default AdminFilterBar;
