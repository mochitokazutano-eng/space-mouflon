import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet } from 'state-shared';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import type { MusicName } from './sound.svelte';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import { TUMBLE_WIN_SOUND_MAP, type TumbleWinStep } from './constants';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';

/**
 * Big-win beds climb while the number counts up. Every big tier starts on `bgm_winlevel_big`
 * (see winLevelMap) and steps up at these fractions of the tier's own presentDuration, so the
 * escalation uses the engine's existing thresholds rather than new ones.
 */
const BIG_WIN_ESCALATION: Partial<Record<WinLevel, { at: number; bgm: MusicName }[]>> = {
	7: [{ at: 0.5, bgm: 'bgm_winlevel_epic' }],
	8: [{ at: 0.45, bgm: 'bgm_winlevel_epic' }],
	9: [
		{ at: 0.4, bgm: 'bgm_winlevel_epic' },
		{ at: 0.75, bgm: 'bgm_winlevel_mega' },
	],
	10: [
		{ at: 0.35, bgm: 'bgm_winlevel_epic' },
		{ at: 0.7, bgm: 'bgm_winlevel_mega' },
	],
};

let bigWinEscalationTimers: ReturnType<typeof setTimeout>[] = [];
let bigWinPresenting = false;

const clearBigWinEscalation = () => {
	bigWinEscalationTimers.forEach((timer) => clearTimeout(timer));
	bigWinEscalationTimers = [];
};

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.sound?.sfx) {
		eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
	}
	if (winLevelData?.sound?.bgm) {
		eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
	}
	if (winLevelData?.type === 'big') {
		bigWinPresenting = true;
		eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });

		clearBigWinEscalation();
		bigWinEscalationTimers = (BIG_WIN_ESCALATION[winLevelData.level] ?? []).map((step) =>
			setTimeout(
				() => eventEmitter.broadcast({ type: 'soundMusic', name: step.bgm }),
				winLevelData.presentDuration * step.at,
			),
		);
	}
};

const winLevelSoundsStop = () => {
	clearBigWinEscalation();
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });

	if (bigWinPresenting) {
		// count-up ended: stinger + coins off, then the panel resolve
		bigWinPresenting = false;
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel', forcePlay: true });
	}

	if (stateGame.gameType === 'freeSpins') {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: positions,
	});
};

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		// book data uses the math-engine's 'basegame'/'freegame' convention; the frontend's
		// GameType uses 'basegame'/'freeSpins' (see Background.svelte, FreeSpinCounter, etc.)
		stateGame.gameType = (bookEvent.gameType as string) === 'freegame' ? 'freeSpins' : 'basegame';
		await stateGameDerived.enhancedBoard.spin({ revealEvent: bookEvent });
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
		// new spin, new cascade chain
		stateGame.cascadeStep = 0;
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		// cascade chain step n -> tumble_win_{min(n,5)}: the pitch climbs with the chain, which
		// is what makes a long cascade feel like an event.
		stateGame.cascadeStep = stateGame.cascadeStep + 1;
		const tumbleWinName = TUMBLE_WIN_SOUND_MAP[
			Math.min(stateGame.cascadeStep, 5) as TumbleWinStep
		];

		const promise1 = async () => {
			eventEmitter.broadcast({ type: 'soundOnce', name: tumbleWinName, forcePlay: true });
			await animateSymbols({ positions: _.flatten(bookEvent.wins.map((win) => win.positions)) });
		};

		const promise2 = async () => {
			await eventEmitter.broadcastAsync({
				type: 'showClusterWinAmounts',
				wins: bookEvent.wins.map((win) => {
					return {
						win: win.meta.winWithoutMult,
						mult: win.meta.globalMult,
						result: win.meta.winWithoutMult * win.meta.globalMult,
						reel: win.meta.overlay.reel,
						row: win.meta.overlay.row,
					};
				}),
			});
		};

		await Promise.all([promise1(), promise2()]);
	},
	updateTumbleWin: async (bookEvent: BookEventOfType<'updateTumbleWin'>) => {
		if (bookEvent.amount > 0) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
			eventEmitter.broadcast({
				type: 'tumbleWinAmountUpdate',
				amount: bookEvent.amount,
				animate: false,
			});
		}
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// animate scatters
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win' });
		await animateSymbols({ positions: bookEvent.positions });
		// show free spin intro: duck the base bed under the jingle, then swap beds
		eventEmitter.broadcast({
			type: 'soundFade',
			name: 'bgm_main',
			from: 1,
			to: 0.25,
			duration: 400,
		});
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs', forcePlay: true });
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		stateGame.gameType = 'freeSpins';
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		await eventEmitter.broadcastAsync({
			type: 'globalMultiplierUpdate',
			multiplier: 1, // resets when multiplier === 1
		});
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateGame.freeSpinTotal = bookEvent.totalFs;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });
	},
	/**
	 * 3+ scatters landing DURING free spins. Deliberately not freeSpinTrigger: we are already in
	 * the free spins scene, so no uiHide/transition, no gameType change, no bgm swap or
	 * jng_intro_fs (bgm_freespin is already playing) and no background swap — just the scatter
	 * animation, the counter's new total, and a short "+N FREE SPINS" beat.
	 */
	freeSpinRetrigger: async (bookEvent: BookEventOfType<'freeSpinRetrigger'>) => {
		// totalFs is the new total, not the delta — see game_config.py's scaling table.
		const addedFreeSpins = Math.max(bookEvent.totalFs - stateGame.freeSpinTotal, 0);
		stateGame.freeSpinTotal = bookEvent.totalFs;

		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win' });
		await animateSymbols({ positions: bookEvent.positions });

		// bump the total straight away so "x of y" reads the awarded spins before the next spin
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});

		if (addedFreeSpins > 0) {
			await eventEmitter.broadcastAsync({
				type: 'freeSpinRetriggerShow',
				amount: addedFreeSpins,
			});
		}
	},
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateGame.freeSpinTotal = bookEvent.total;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount,
			total: bookEvent.total,
		});
	},
	updateGlobalMult: async (bookEvent: BookEventOfType<'updateGlobalMult'>) => {
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		if (bookEvent.globalMult === 1) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		}
		await eventEmitter.broadcastAsync({
			type: 'globalMultiplierUpdate',
			multiplier: bookEvent.globalMult, // resets when multiplier === 1
		});
	},
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinOutroCountUp',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},
	boardMultiplierInfo: async (bookEvent: BookEventOfType<'boardMultiplierInfo'>) => {
		eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
		await eventEmitter.broadcastAsync({
			type: 'tumbleWinAmountUpdate',
			amount: bookEvent.winInfo.tumbleWin,
			animate: false,
		});
		eventEmitter.broadcast({ type: 'multiplierBoardShow' });
		eventEmitter.broadcast({ type: 'multiplierBoardInit' });
		// the meteors are about to glide together and sum
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_combine_a' });
		await eventEmitter.broadcastAsync({ type: 'multiplierBoardAnimate' });
		eventEmitter.broadcast({ type: 'boardWithMovingMultiplierTexts' });
		await eventEmitter.broadcastAsync({ type: 'multiplierBoardMove' });
		eventEmitter.broadcast({ type: 'multiplierBoardReset' });
		eventEmitter.broadcast({ type: 'multiplierBoardHide' });
		eventEmitter.broadcast({ type: 'multiplierTotalShow' });
		eventEmitter.broadcast({
			type: 'multiplierTotalUpdate',
			totalMultiplier: bookEvent.winInfo.boardMult,
		});
		// ratchet resolving on a bell — lands with the total's readout
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_up' });
		await eventEmitter.broadcastAsync({ type: 'multiplierTotalAnimate' });
		// the multiplier slamming onto the win total
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_win' });
		eventEmitter.broadcast({ type: 'multiplierTotalHide' });
		await eventEmitter.broadcastAsync({
			type: 'tumbleWinAmountUpdate',
			amount: bookEvent.winInfo.totalWin,
			animate: true,
		});
	},
	tumbleBoard: async (bookEvent: BookEventOfType<'tumbleBoard'>) => {
		eventEmitter.broadcast({ type: 'boardHide' });
		eventEmitter.broadcast({ type: 'tumbleBoardShow' });
		eventEmitter.broadcast({ type: 'tumbleBoardInit', addingBoard: bookEvent.newSymbols });
		await eventEmitter.broadcastAsync({
			type: 'tumbleBoardExplode',
			explodingPositions: bookEvent.explodingSymbols,
		});
		eventEmitter.broadcast({ type: 'tumbleBoardRemoveExploded' });
		await eventEmitter.broadcastAsync({ type: 'tumbleBoardSlideDown' });
		// board refilled
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_symbols_landing', forcePlay: true });
		eventEmitter.broadcast({
			type: 'boardSettle',
			board: stateGameDerived
				.tumbleBoardCombined()
				.map((tumbleReel) => tumbleReel.map((tumbleSymbol) => tumbleSymbol.rawSymbol)),
		});
		eventEmitter.broadcast({ type: 'tumbleBoardReset' });
		eventEmitter.broadcast({ type: 'tumbleBoardHide' });
		eventEmitter.broadcast({ type: 'boardShow' });
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	finalWin: async (bookEvent: BookEventOfType<'finalWin'>) => {
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
	},
	// customised
	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastUpdateGlobalMultEvent = findLastBookEvent('updateGlobalMult' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });
	},
};
