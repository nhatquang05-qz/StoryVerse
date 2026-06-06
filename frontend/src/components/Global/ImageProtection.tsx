import React, { useEffect } from 'react';

const ImageProtection: React.FC = () => {
	useEffect(() => {
		const handleContextMenu = (e: MouseEvent) => {
			if ((e.target as HTMLElement).tagName === 'IMG') {
				e.preventDefault();
			}
		};

		const handleDragStart = (e: DragEvent) => {
			if ((e.target as HTMLElement).tagName === 'IMG') {
				e.preventDefault();
			}
		};

		document.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('dragstart', handleDragStart);

		return () => {
			document.removeEventListener('contextmenu', handleContextMenu);
			document.removeEventListener('dragstart', handleDragStart);
		};
	}, []);

	return (
		<style>{`
            img {
                -webkit-user-drag: none;
                -khtml-user-drag: none;
                -moz-user-drag: none;
                -o-user-drag: none;
                user-drag: none;
                
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -o-user-select: none;
                user-select: none;
                
                pointer-events: auto; /* Đảm bảo vẫn click được nếu ảnh là link/nút */
            }
        `}</style>
	);
};

export default ImageProtection;
