import React from 'react';
import { type Genre } from '../../types/comicTypes';
import '../../assets/styles/AdminPage.css';

interface GenreSelectorProps {
    allGenres: Genre[];
    selectedGenres: number[];
    onChange: (genreId: number) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ allGenres, selectedGenres, onChange }) => {
    return (
        <div className="genre-selector">
            {allGenres.map(genre => (
                <label key={genre.id} className="genre-checkbox-label">
                    <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.id)}
                        onChange={() => onChange(genre.id)}
                    />
                    {genre.name}
                </label>
            ))}
        </div>
    );
};

export default GenreSelector;