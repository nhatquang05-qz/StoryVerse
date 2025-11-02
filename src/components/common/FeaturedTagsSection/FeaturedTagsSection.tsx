import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRightCircle } from 'react-icons/fi'; 
import '../../../styles/FeaturedTagsSection.css';
import action from './action.png';
import romance from './romance.png';
import comedy from './comedy.png';
import fantasy from './fantasy.png';

interface FeaturedTag {
  name: string;
  count: number;
  imageUrl: string;
  color: string;
  link: string;
}

const featuredTagsData: FeaturedTag[] = [
  { name: 'ACTION', count: 5379, imageUrl: action, color: '#4A90E2', link: '/genres/action' },
  { name: 'ROMANCE', count: 5364, imageUrl: romance, color: '#D95C5C', link: '/genres/romance' },
  { name: 'COMEDY', count: 5078, imageUrl: comedy, color: '#50E3C2', link: '/genres/comedy' },
  { name: 'FANTASY', count: 3463, imageUrl: fantasy, color: '#AE81FF', link: '/genres/fantasy' },
];

const FeaturedTagsSection: React.FC = () => {
    return (
        <div className="featured-tags-section">
            <h2 className="section-title">TAGS NỔI BẬT</h2>
            <p className="section-subtitle">Các tags tại StoryVerse</p>

            <div className="tags-container">
                {featuredTagsData.map((tag) => (
                    <Link to={tag.link} key={tag.name} className="tag-card-link">
                        <div
                            className="tag-card"
                            style={{ backgroundColor: tag.color }}
                        >
                            <div className="tag-card-content">
                                <div className="tag-header">
                                    <span className="tag-name">{tag.name}</span>
                                    <FiArrowRightCircle className="tag-arrow-icon" />
                                </div>
                                <div className="tag-count">
                                    {tag.count.toLocaleString('vi-VN')}
                                    <span>Bộ Truyện</span>
                                </div>
                            </div>
                            <img src={tag.imageUrl} alt={tag.name} className="tag-bg-image" />
                             <div className="tag-shape-extension"></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FeaturedTagsSection;