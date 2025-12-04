import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useFont } from '../contexts/FontContext';
import '../assets/styles/SettingPage.css';
import mikaelaPreview from '../assets/cursors/Mikaela_Hykuya.png';
import krulTepesPreview from '../assets/cursors/Krul_Tepes.png';
import enePreview from '../assets/cursors/Ene.png';
import YuichiroPreview from '../assets/cursors/Yuichiro.png';

const CURSOR_STORAGE_KEY = 'storyverse_custom_cursor_pack';

interface CursorPack {
	id: string;
	name: string;
	basePath: string;
	defaultFile: string;
	previewImage: string;
}

const CURSOR_FILE_NAMES: { [key: string]: string } = {
	default: 'Alternative.cur',
	pointer: 'link.cur',
	text: 'Escritura a Mano.cur',
	move: 'movec.cur',
	help: 'ayuda.cur',
	nwse: 'diagonal resize 1.cur',
	nesw: 'diagonal resize 2.cur',
	ew: 'horizontal.cur',
};

const CURSOR_PACKS: CursorPack[] = [
	{
		id: 'Mikaela',
		name: 'Mikaela Hyakuya',
		basePath: '../../src/assets/cursors/Mikaela_Hykuya_Cursor',
		defaultFile: CURSOR_FILE_NAMES['default'],
		previewImage: mikaelaPreview,
	},
	{
		id: 'KrulTepes',
		name: 'Krul Tepes',
		basePath: '../../src/assets/cursors/Krul_Tepes_Cursor',
		defaultFile: CURSOR_FILE_NAMES['default'],
		previewImage: krulTepesPreview,
	},
	{
		id: 'Ene',
		name: 'Ene',
		basePath: '../../src/assets/cursors/Ene_Cursor',
		defaultFile: CURSOR_FILE_NAMES['default'],
		previewImage: enePreview,
	},
	{
		id: 'YuichiroHyakuya',
		name: 'Yuichiro Hyakuya',
		basePath: '../../src/assets/cursors/Yuichiro_Hyakuya_Cursor',
		defaultFile: CURSOR_FILE_NAMES['default'],
		previewImage: YuichiroPreview,
	},
];

const applyCursorStyles = (packId: string) => {
	const selectedPack = CURSOR_PACKS.find((p) => p.id === packId);
	if (!selectedPack) return;
	const root = document.documentElement;
	Object.entries(CURSOR_FILE_NAMES).forEach(([key, fileName]) => {
		root.style.setProperty(
			`--cursor-path-${key}`,
			`url('${selectedPack.basePath}/${fileName}')`,
		);
	});
	root.style.setProperty('cursor', `var(--cursor-path-default), default`, 'important');
};

const SettingsPage: React.FC = () => {
	const { showNotification } = useNotification();
	const { selectedFont, selectFont, fontOptions } = useFont();

	const [selectedCursorPackId, setSelectedCursorPackId] = useState<string>(() => {
		const storedId = localStorage.getItem(CURSOR_STORAGE_KEY);
		return storedId && CURSOR_PACKS.find((p) => p.id === storedId)
			? storedId
			: CURSOR_PACKS[0].id;
	});

	useEffect(() => {
		applyCursorStyles(selectedCursorPackId);
		localStorage.setItem(CURSOR_STORAGE_KEY, selectedCursorPackId);
	}, [selectedCursorPackId]);

	useEffect(() => {
		applyCursorStyles(selectedCursorPackId);
	}, []);

	const handleCursorPackSelect = (packId: string) => {
		setSelectedCursorPackId(packId);
		showNotification(
			`Đã đổi bộ con trỏ mặc định sang ${CURSOR_PACKS.find((opt) => opt.id === packId)?.name}`,
			'success',
		);
	};

	const handleFontSelect = (fontId: string) => {
		selectFont(fontId);
		const fontName = fontOptions.find((f) => f.id === fontId)?.name || 'font';
		showNotification(`Đã đổi font chữ thành ${fontName}`, 'success');
	};

	return (
		<div className="settings-page-container">
			<div className="settings-content-wrapper">
				<Link to="/profile" className="settings-back-btn">
					<FiArrowLeft /> Quay lại Hồ sơ
				</Link>
				<h1 className="settings-page-title">
					<FiSettings /> Cài Đặt{' '}
				</h1>

				<div className="settings-card" style={{ marginBottom: '2rem' }}>
					<h2>Tùy Chỉnh Font Chữ</h2>
					<p className="description">
						Chọn font chữ bạn muốn sử dụng trên toàn bộ trang web.
					</p>
					<div className="font-pack-options">
						{fontOptions.map((font) => (
							<div
								key={font.id}
								className={`font-option ${selectedFont.id === font.id ? 'selected' : ''}`}
								onClick={() => handleFontSelect(font.id)}
							>
								<div
									className="font-option-name"
									style={{ fontFamily: font.cssVariable }}
								>
									{font.name}
								</div>
								<p
									className="font-option-preview"
									style={{ fontFamily: font.cssVariable }}
								>
									StoryVerse
								</p>
								{selectedFont.id === font.id && (
									<FiCheckCircle className="font-option-check" />
								)}
							</div>
						))}
					</div>
				</div>

				<div className="settings-card">
					<h2>Tùy Chỉnh Con Trỏ Chuột Anime</h2>
					<p className="description">Chọn con trỏ chuột bạn muốn sử dụng.</p>
					<div className="cursor-pack-options">
						{CURSOR_PACKS.map((pack) => (
							<div
								key={pack.id}
								className={`cursor-option ${selectedCursorPackId === pack.id ? 'selected' : ''}`}
								onClick={() => handleCursorPackSelect(pack.id)}
							>
								<img
									src={pack.previewImage}
									alt={pack.name}
									className="cursor-option-image"
								/>
								<p className="cursor-option-name">{pack.name}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
