import { sharedAssetsPixi } from 'constants-shared/assets';

export default {
	// UI art shared with components-ui-pixi (spin button, pills, plates, icons)
	...sharedAssetsPixi,
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/pressAnywhere.json', import.meta.url).href,
		preload: true,
	},
	bgBase: {
		type: 'sprite',
		src: new URL('../../assets/sprites/backgrounds/bg_base.png', import.meta.url).href,
		preload: true,
	},
	bgFreespins: {
		type: 'sprite',
		src: new URL('../../assets/sprites/backgrounds/bg_freespins.png', import.meta.url).href,
		preload: true,
	},
	bgBasePortrait: {
		type: 'sprite',
		src: new URL('../../assets/sprites/backgrounds/bg_base_portrait.png', import.meta.url).href,
		// preloaded like the landscape pair: in portrait these are the first thing drawn, and
		// without it the background Sprite logs a missing-key error until the second load pass.
		preload: true,
	},
	bgFreespinsPortrait: {
		type: 'sprite',
		src: new URL('../../assets/sprites/backgrounds/bg_freespins_portrait.png', import.meta.url).href,
		preload: true,
	},
	H1: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/H1.png', import.meta.url).href,
	},
	H2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/H2.png', import.meta.url).href,
	},
	H3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/H3.png', import.meta.url).href,
	},
	H4: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/H4.png', import.meta.url).href,
	},
	L1: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/L1.png', import.meta.url).href,
	},
	L2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/L2.png', import.meta.url).href,
	},
	L3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/L3.png', import.meta.url).href,
	},
	L4: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/L4.png', import.meta.url).href,
	},
	L5: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/L5.png', import.meta.url).href,
	},
	M: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/M.png', import.meta.url).href,
	},
	S: {
		type: 'sprite',
		src: new URL('../../assets/sprites/mouflon/S.png', import.meta.url).href,
	},
	frameReels: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/frame_reels.png', import.meta.url).href,
		preload: true,
	},
	gameLogo: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/space_mouflon_logo.png', import.meta.url).href,
		preload: true,
	},
	plateValue: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/plate_value.png', import.meta.url).href,
	},
	screenLandscape: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/screen_landscape.png', import.meta.url).href,
		preload: true,
	},
	screenPortrait: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/screen_portrait.png', import.meta.url).href,
		preload: true,
	},
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/goldFont/mm_gold.xml', import.meta.url).href,
	},
	explosion: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/explosion.json', import.meta.url).href,
			scale: 2,
		},
	},
	bigwin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/bigwin/big_wins.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/bigwin/mm_bigwin.json', import.meta.url).href,
			scale: 2,
		},
	},
	tumble_multiplier: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/tumbleWin/tumble_multiplier.json', import.meta.url).href,
			scale: 2,
		},
	},
	tumble_win: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/tumbleWin/tumble_win.json', import.meta.url).href,
			scale: 2,
		},
	},
	progressBar: {
		type: 'sprites',
		src: new URL('../../assets/sprites/progressBar/progressBar.json', import.meta.url).href,
		preload: true,
	},
	coins: {
		type: 'spriteSheet',
		src: new URL('../../assets/sprites/coin/coin.json', import.meta.url).href,
	},
} as const;
