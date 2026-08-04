/**
 * Hand-written retrigger book.
 *
 * The generated books in `bonus_books.ts` contain zero `freeSpinRetrigger` events, so the
 * handler had no coverage until this file existed. Sequence: trigger 8 spins -> two spins ->
 * 3 scatters land in the free game -> retrigger to 13 -> two more spins -> end.
 *
 * The boards are lifted from a real generated bonus book; the retrigger board is that same
 * free-game board with three scatters placed by hand.
 */
export default {
	id: 1,
	payoutMultiplier: 0,
	events: [
		{
			index: 0,
			type: 'reveal',
			board: [
				[
					{
						name: 'L1',
					},
					{
						name: 'L1',
					},
					{
						name: 'L3',
					},
					{
						name: 'H4',
					},
					{
						name: 'S',
						scatter: true,
					},
					{
						name: 'L3',
					},
					{
						name: 'L3',
					},
				],
				[
					{
						name: 'H4',
					},
					{
						name: 'L1',
					},
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'H2',
					},
					{
						name: 'L1',
					},
					{
						name: 'H2',
					},
				],
				[
					{
						name: 'L3',
					},
					{
						name: 'H3',
					},
					{
						name: 'L1',
					},
					{
						name: 'L1',
					},
					{
						name: 'H4',
					},
					{
						name: 'L2',
					},
					{
						name: 'H4',
					},
				],
				[
					{
						name: 'H2',
					},
					{
						name: 'S',
						scatter: true,
					},
					{
						name: 'L2',
					},
					{
						name: 'H2',
					},
					{
						name: 'H2',
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
				],
				[
					{
						name: 'H1',
					},
					{
						name: 'H3',
					},
					{
						name: 'H3',
					},
					{
						name: 'H4',
					},
					{
						name: 'S',
						scatter: true,
					},
					{
						name: 'H3',
					},
					{
						name: 'L1',
					},
				],
				[
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'L1',
					},
					{
						name: 'H3',
					},
					{
						name: 'S',
						scatter: true,
					},
					{
						name: 'H4',
					},
					{
						name: 'H2',
					},
				],
			],
			paddingPositions: [98, 155, 195, 101, 98, 41],
			gameType: 'basegame',
			anticipation: [0, 0, 0, 0, 1, 2],
		},
		{
			index: 1,
			type: 'setTotalWin',
			amount: 0,
		},
		{
			index: 2,
			type: 'freeSpinTrigger',
			totalFs: 8,
			positions: [
				{
					reel: 0,
					row: 4,
				},
				{
					reel: 3,
					row: 1,
				},
				{
					reel: 4,
					row: 4,
				},
				{
					reel: 5,
					row: 4,
				},
			],
		},
		{
			index: 3,
			type: 'updateFreeSpin',
			amount: 1,
			total: 8,
		},
		{
			index: 4,
			type: 'updateGlobalMult',
			globalMult: 1,
		},
		{
			index: 5,
			type: 'reveal',
			board: [
				[
					{
						name: 'H4',
					},
					{
						name: 'H1',
					},
					{
						name: 'H1',
					},
					{
						name: 'H1',
					},
					{
						name: 'H4',
					},
					{
						name: 'H1',
					},
					{
						name: 'H4',
					},
				],
				[
					{
						name: 'L2',
					},
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'H3',
					},
					{
						name: 'H4',
					},
					{
						name: 'H3',
					},
					{
						name: 'H3',
					},
				],
				[
					{
						name: 'L1',
					},
					{
						name: 'H2',
					},
					{
						name: 'M',
						multiplier: 4,
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'H3',
					},
					{
						name: 'L1',
					},
				],
				[
					{
						name: 'L3',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
					{
						name: 'H1',
					},
					{
						name: 'H1',
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
				],
				[
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
					{
						name: 'L2',
					},
					{
						name: 'H1',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
				],
				[
					{
						name: 'H2',
					},
					{
						name: 'H2',
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'L2',
					},
				],
			],
			paddingPositions: [178, 114, 68, 184, 205, 58],
			gameType: 'freegame',
			anticipation: [0, 0, 0, 0, 0, 0],
		},
		{
			index: 6,
			type: 'setTotalWin',
			amount: 0,
		},
		{
			index: 7,
			type: 'updateFreeSpin',
			amount: 2,
			total: 8,
		},
		{
			index: 8,
			type: 'updateGlobalMult',
			globalMult: 1,
		},
		{
			index: 9,
			type: 'reveal',
			board: [
				[
					{
						name: 'H4',
					},
					{
						name: 'H1',
					},
					{
						name: 'S',
						scatter: true,
					},
					{
						name: 'H1',
					},
					{
						name: 'H4',
					},
					{
						name: 'H1',
					},
					{
						name: 'H4',
					},
				],
				[
					{
						name: 'L2',
					},
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'H3',
					},
					{
						name: 'H4',
					},
					{
						name: 'H3',
					},
					{
						name: 'H3',
					},
				],
				[
					{
						name: 'L1',
					},
					{
						name: 'H2',
					},
					{
						name: 'M',
						multiplier: 4,
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'H3',
					},
					{
						name: 'L1',
					},
				],
				[
					{
						name: 'L3',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
					{
						name: 'H1',
					},
					{
						name: 'H1',
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
				],
				[
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
					{
						name: 'S',
						scatter: true,
					},
					{
						name: 'H1',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
				],
				[
					{
						name: 'H2',
					},
					{
						name: 'S',
						scatter: true,
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'L2',
					},
				],
			],
			paddingPositions: [178, 114, 68, 184, 205, 58],
			gameType: 'freegame',
			anticipation: [0, 0, 0, 0, 1, 2],
		},
		{
			index: 10,
			type: 'freeSpinRetrigger',
			totalFs: 13,
			positions: [
				{
					reel: 0,
					row: 2,
				},
				{
					reel: 4,
					row: 3,
				},
				{
					reel: 5,
					row: 1,
				},
			],
		},
		{
			index: 11,
			type: 'setTotalWin',
			amount: 0,
		},
		{
			index: 12,
			type: 'updateFreeSpin',
			amount: 3,
			total: 13,
		},
		{
			index: 13,
			type: 'updateGlobalMult',
			globalMult: 1,
		},
		{
			index: 14,
			type: 'reveal',
			board: [
				[
					{
						name: 'H4',
					},
					{
						name: 'H1',
					},
					{
						name: 'H1',
					},
					{
						name: 'H1',
					},
					{
						name: 'H4',
					},
					{
						name: 'H1',
					},
					{
						name: 'H4',
					},
				],
				[
					{
						name: 'L2',
					},
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'H3',
					},
					{
						name: 'H4',
					},
					{
						name: 'H3',
					},
					{
						name: 'H3',
					},
				],
				[
					{
						name: 'L1',
					},
					{
						name: 'H2',
					},
					{
						name: 'M',
						multiplier: 4,
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'H3',
					},
					{
						name: 'L1',
					},
				],
				[
					{
						name: 'L3',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
					{
						name: 'H1',
					},
					{
						name: 'H1',
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
				],
				[
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
					{
						name: 'L2',
					},
					{
						name: 'H1',
					},
					{
						name: 'L2',
					},
					{
						name: 'L1',
					},
				],
				[
					{
						name: 'H2',
					},
					{
						name: 'H2',
					},
					{
						name: 'L2',
					},
					{
						name: 'L2',
					},
					{
						name: 'H4',
					},
					{
						name: 'H4',
					},
					{
						name: 'L2',
					},
				],
			],
			paddingPositions: [178, 114, 68, 184, 205, 58],
			gameType: 'freegame',
			anticipation: [0, 0, 0, 0, 0, 0],
		},
		{
			index: 15,
			type: 'setTotalWin',
			amount: 0,
		},
		{
			index: 16,
			type: 'updateFreeSpin',
			amount: 4,
			total: 13,
		},
		{
			index: 17,
			type: 'updateGlobalMult',
			globalMult: 1,
		},
		{
			index: 18,
			type: 'freeSpinEnd',
			amount: 0,
			winLevel: 1,
		},
		{
			index: 19,
			type: 'finalWin',
			amount: 0,
		},
	],
	criteria: 'freegame',
	baseGameWins: 0,
	freeGameWins: 0,
};
