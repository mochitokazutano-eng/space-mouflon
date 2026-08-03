import { sharedAssetsPixi } from 'constants-shared/assets';

export default {
	// UI art shared with components-ui-pixi (spin button, pills, plates, icons)
	...sharedAssetsPixi,
	loader: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/loader/loader.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/loader/loader.json', import.meta.url).href,
			scale: 2,
		},
		preload: true,
	},
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url).href,
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
	explosion: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/explosion.json', import.meta.url).href,
			scale: 2,
		},
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
	payFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/payFrame/payFrame.png', import.meta.url).href,
	},
	anticipation: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/anticipation/anticipation.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/anticipation/anticipation.json', import.meta.url).href,
			scale: 2,
		},
	},
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/goldFont/mm_gold.xml', import.meta.url).href,
	},
	goldBlur: {
		type: 'font',
		src: new URL('../../assets/fonts/goldBlur/miningfont_gold_blur.xml', import.meta.url).href,
	},
	silverFont: {
		type: 'font',
		src: new URL('../../assets/fonts/silverFont/mm_silver.xml', import.meta.url).href,
	},
	purpleFont: {
		type: 'font',
		src: new URL('../../assets/fonts/purpleFont/mm_purple.xml', import.meta.url).href,
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
	clusterWin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/clusterWin/clusterpay.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/clusterWin/clusterpay.json', import.meta.url).href,
			scale: 2,
		},
	},
	symbolsStatic: {
		type: 'sprites',
		src: new URL('../../assets/sprites/symbolsStatic/symbolsStatic.json', import.meta.url).href,
	},
	coins: {
		type: 'spriteSheet',
		src: new URL('../../assets/sprites/coin/SD2_Coin.json', import.meta.url).href,
	},
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
