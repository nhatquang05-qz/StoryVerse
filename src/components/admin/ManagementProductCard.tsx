import React from 'react';
import { type ComicSummary } from '../../types/comicTypes';
import { FiEdit, FiTrash2, FiList } from 'react-icons/fi';

interface ManagementProductCardProps {
	comic: ComicSummary;
	onEdit: () => void;
	onDelete: () => void;
	onManageChapters: () => void;
}

const ManagementProductCard: React.FC<ManagementProductCardProps> = ({
	comic,
	onEdit,
	onDelete,
	onManageChapters,
}) => {
	return (
		<div className="mgmt-card">
			<img src={comic.coverImageUrl} alt={comic.title} className="mgmt-card-image" />
			<div className="mgmt-card-info">
				<h4 className="mgmt-card-title">{comic.title}</h4>
				<span className="mgmt-card-id">ID: {comic.id}</span>
				<span className={`mgmt-card-status ${comic.status}`}>{comic.status}</span>
				<span className={`mgmt-card-type ${comic.isDigital ? 'digital' : 'physical'}`}>
					{comic.isDigital ? 'Digital' : 'Physical'}
				</span>
			</div>
			<div className="mgmt-card-actions">
				<button className="mgmt-btn edit" onClick={onEdit}>
					<FiEdit /> Sửa
				</button>
				<button className="mgmt-btn delete" onClick={onDelete}>
					<FiTrash2 /> Xóa
				</button>
				{comic.isDigital && (
					<button className="mgmt-btn chapters" onClick={onManageChapters}>
						<FiList /> Chương
					</button>
				)}
			</div>
		</div>
	);
};

export default ManagementProductCard;
