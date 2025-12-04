const stickerModules = import.meta.glob(
	'../components/common/Chat/stickers/*/*.{png,gif,jpg,jpeg,webp}',
	{ eager: true, as: 'url' },
);

export interface Sticker {
	id: string;
	url: string;
	pack: string;
}

export interface StickerPack {
	name: string;
	stickers: Sticker[];
}

export const stickerPacks: StickerPack[] = [];

const packsMap: { [key: string]: Sticker[] } = {};

for (const path in stickerModules) {
	const url = stickerModules[path];
	const match = path.match(/stickers\/([^/]+)\//);
	if (match && match[1]) {
		const packName = match[1];
		if (!packsMap[packName]) {
			packsMap[packName] = [];
		}
		packsMap[packName].push({ id: path, url: url, pack: packName });
	}
}

for (const packName in packsMap) {
	stickerPacks.push({ name: packName, stickers: packsMap[packName] });
}

stickerPacks.sort((a, b) => a.name.localeCompare(b.name));
