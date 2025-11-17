import React from 'react';
import { type ComicSummary } from '../../types/comicTypes';
import ManagementProductCard from './ManagementProductCard';

interface ComicManagementListProps {
    comics: ComicSummary[];
    onEdit: (comic: ComicSummary) => void;
    onDelete: (comic: ComicSummary) => void;
    onManageChapters: (comic: ComicSummary) => void;
}

const ComicManagementList: React.FC<ComicManagementListProps> = ({ comics, onEdit, onDelete, onManageChapters }) => {
    return (
        <div className="admin-comic-list">
            {comics.length === 0 && <p>Không tìm thấy truyện nào phù hợp.</p>}
            {comics.map(comic => (
                <ManagementProductCard
                    key={comic.id}
                    comic={comic}
                    onEdit={() => onEdit(comic)}
                    onDelete={() => onDelete(comic)}
                    onManageChapters={() => onManageChapters(comic)}
                />
            ))}
        </div>
    );
};

export default ComicManagementList;