import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 100;

export const REEL_PADDING = 0.53;

// meteor's gold badge is ~37% of SYMBOL_SIZE across; sized to fit the widest value ("100×")
export const METEOR_VALUE_FONT_SIZE = 16;

// Every `fontFamily: 'gold'` BitmapText is tinted with this so the sample's mm_gold font
// harmonises with our horn gold. Letterforms are unchanged — this is colour only.
export const GOLD_TEXT_TINT = 0xf6c445;

// initial board (padded top and bottom)
export const INITIAL_BOARD: RawSymbol[][] = [
	[
		{ name: 'M', multiplier: 10 },
		{ name: 'H1' },
		{ name: 'M', multiplier: 2 },
		{ name: 'L1' },
		{ name: 'H1' },
		{ name: 'H4' },
		{ name: 'H1' },
	],
	[
		{ name: 'L3' },
		{ name: 'H2' },
		{ name: 'M', multiplier: 4 },
		{ name: 'L2' },
		{ name: 'S', scatter: true },
		{ name: 'S', scatter: true },
		{ name: 'L2' },
	],
	[
		{ name: 'L2' },
		{ name: 'H3' },
		{ name: 'M', multiplier: 5 },
		{ name: 'L3' },
		{ name: 'L5' },
		{ name: 'L2' },
		{ name: 'L2' },
	],
	[
		{ name: 'L3' },
		{ name: 'H4' },
		{ name: 'M', multiplier: 7 },
		{ name: 'L4' },
		{ name: 'L5' },
		{ name: 'H1' },
		{ name: 'H1' },
	],
	[
		{ name: 'H3' },
		{ name: 'H4' },
		{ name: 'M', multiplier: 10 },
		{ name: 'H2' },
		{ name: 'S', scatter: true },
		{ name: 'L2' },
		{ name: 'M', multiplier: 7 },
	],
	[
		{ name: 'H2' },
		{ name: 'H2' },
		{ name: 'S', scatter: true },
		{ name: 'L3' },
		{ name: 'H1' },
		{ name: 'S', scatter: true },
		{ name: 'L2' },
	],
];

export const BOARD_DIMENSIONS = { x: INITIAL_BOARD.length, y: INITIAL_BOARD[0].length - 2 };

export const BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y,
};

export const BACKGROUND_RATIO = 1920 / 1080;
export const PORTRAIT_BACKGROUND_RATIO = 1080 / 1920;
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

const SPIN_OPTIONS_SHARED = {
	reelFallInDelay: 80,
	reelPaddingMultiplierNormal: 1.25,
	reelPaddingMultiplierAnticipated: 18,
	reelFallOutDelay: 145,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 3.5,
	symbolFallInInterval: 30,
	symbolFallInBounceSpeed: 0.15,
	symbolFallInBounceSizeMulti: 0.5,
	symbolFallOutSpeed: 3.5,
	symbolFallOutInterval: 20,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 7,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 0.3,
	symbolFallInBounceSizeMulti: 0.25,
	symbolFallOutSpeed: 7,
	symbolFallOutInterval: 0,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 1, height: 1 },
};

const mk = (key: string, ratio = 1) =>
	({ type: 'sprite', assetKey: key, sizeRatios: { width: ratio, height: ratio } }) as const;

export const SYMBOL_INFO_MAP = {
	H1: { explosion, win: mk('H1'), static: mk('H1'), spin: mk('H1'), land: mk('H1'), postWinStatic: mk('H1') },
	H2: { explosion, win: mk('H2'), static: mk('H2'), spin: mk('H2'), land: mk('H2'), postWinStatic: mk('H2') },
	H3: { explosion, win: mk('H3'), static: mk('H3'), spin: mk('H3'), land: mk('H3'), postWinStatic: mk('H3') },
	H4: { explosion, win: mk('H4'), static: mk('H4'), spin: mk('H4'), land: mk('H4'), postWinStatic: mk('H4') },
	L1: { explosion, win: mk('L1'), static: mk('L1'), spin: mk('L1'), land: mk('L1'), postWinStatic: mk('L1') },
	L2: { explosion, win: mk('L2'), static: mk('L2'), spin: mk('L2'), land: mk('L2'), postWinStatic: mk('L2') },
	L3: { explosion, win: mk('L3'), static: mk('L3'), spin: mk('L3'), land: mk('L3'), postWinStatic: mk('L3') },
	L4: { explosion, win: mk('L4'), static: mk('L4'), spin: mk('L4'), land: mk('L4'), postWinStatic: mk('L4') },
	L5: { explosion, win: mk('L5'), static: mk('L5'), spin: mk('L5'), land: mk('L5'), postWinStatic: mk('L5') },
	S: {
		explosion,
		win: mk('S', 1.15),
		static: mk('S', 1.15),
		spin: mk('S', 1.15),
		land: mk('S', 1.15),
		postWinStatic: mk('S', 1.15),
	},
	M: { explosion, win: mk('M'), static: mk('M'), spin: mk('M'), land: mk('M'), postWinStatic: mk('M') },
	M_TAKEN: {
		explosion,
		win: mk('M'),
		static: mk('M'),
		spin: mk('M'),
		land: mk('M'),
		postWinStatic: mk('M'),
	},
} as const;

// Cascade wins climb in pitch by chain step, clamped at 5.
export const TUMBLE_WIN_SOUND_MAP = {
	1: 'tumble_win_1',
	2: 'tumble_win_2',
	3: 'tumble_win_3',
	4: 'tumble_win_4',
	5: 'tumble_win_5',
} as const;

export type TumbleWinStep = keyof typeof TUMBLE_WIN_SOUND_MAP;

// Reel stops fire left to right, one variant per reel, for a rising cadence.
export const REEL_STOP_SOUND_MAP = {
	1: 'sfx_reel_stop_1',
	2: 'sfx_reel_stop_2',
	3: 'sfx_reel_stop_3',
	4: 'sfx_reel_stop_4',
	5: 'sfx_reel_stop_5',
	6: 'sfx_reel_stop_6',
} as const;

export type ReelStopIndex = keyof typeof REEL_STOP_SOUND_MAP;

// Scatter stops ladder by scatter COUNT, not reel index — the 4th is the trigger and is the
// loudest cue in the pack's ladder. Counts above 4 stay on _4.
export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
} as const;
