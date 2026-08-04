import { stateMeta, type BetModeMeta, type GameRuleMeta } from 'state-shared';

/**
 * Space Mouflon game metadata.
 *
 * `state-shared` ships sample bet modes and sample game rules as its defaults. Those describe a
 * different game (six bet modes, a wild symbol, a lines paytable) and point at external CDN URLs,
 * so this module replaces both wholesale.
 *
 * Two hard rules:
 *  - Bet mode keys and `mode` strings must match `math-sdk/games/space_mouflon/game_config.py`
 *    exactly — `stateBet.activeBetModeKey` is sent verbatim as `mode` to POST /wallet/play.
 *  - Every asset/image value must be a local path or an empty string. The Stake build is fully
 *    static, so an external URL is a broken asset there.
 */

const MAX_WIN = 20000;

// Symbol art is served from static/, which SvelteKit mounts at the site root.
const symbolImage = (key: string) => `/assets/sprites/mouflon/${key}.png`;

// ---------------------------------------------------------------------------
// Bet modes
// ---------------------------------------------------------------------------

const betModeMeta: BetModeMeta = {
	base: {
		mode: 'base',
		costMultiplier: 1.0,
		type: 'default',
		parent: '',
		children: '',
		assets: {
			icon: '',
			dialogImage: '',
			dialogVolatility: '',
			volatility: '',
			button: '',
		},
		text: {
			title: 'BASE GAME',
			dialog: '',
			button: '',
			betAmountLabel: '',
			tickerIdle: 'PLACE YOUR BET',
			tickerSpin: 'GOOD LUCK',
		},
		maxWin: MAX_WIN,
	},
	ante: {
		mode: 'ante',
		costMultiplier: 1.25,
		type: 'activate',
		parent: '',
		children: '',
		assets: {
			icon: '',
			dialogImage: '',
			dialogVolatility: '',
			volatility: '',
			button: '',
		},
		text: {
			title: 'DOUBLE CHANCE',
			dialog:
				'Roughly doubles the chance of triggering FREE SPINS when activated, for 1.25x the player bet amount. DOUBLE CHANCE remains active until disabled by the player.',
			description: 'Roughly double your chance of triggering FREE SPINS.',
			button: 'ACTIVATE',
			betAmountLabel: 'DOUBLE CHANCE',
			tickerIdle: 'DOUBLE CHANCE IS ACTIVE',
			tickerSpin: 'GOOD LUCK',
		},
		maxWin: MAX_WIN,
	},
	bonus: {
		mode: 'bonus',
		costMultiplier: 100,
		type: 'buy',
		parent: '',
		children: '',
		assets: {
			icon: '',
			dialogImage: '',
			dialogVolatility: '',
			volatility: '',
			button: '',
		},
		text: {
			title: 'BONUS BUY',
			dialog:
				'Instantly triggers FREE SPINS for 100x the player bet amount. Cosmic Meteor multipliers land during FREE SPINS, their values sum, and the total multiplies the whole cascade for that spin.',
			description: 'Instantly trigger FREE SPINS with Cosmic Meteor multipliers.',
			button: 'BUY',
			tickerIdle: 'PLACE YOUR BET',
			tickerSpin: 'BONUS BUY ACTIVATED',
		},
		maxWin: MAX_WIN,
	},
};

// ---------------------------------------------------------------------------
// Paytable
// ---------------------------------------------------------------------------

// Pay-anywhere counts, highest tier first — the order the rows are printed in.
type PaySymbol = { key: string; name: string; low: string; mid: string; high: string };

const PAY_SYMBOLS: PaySymbol[] = [
	{ key: 'H1', name: 'GOLDEN MOUFLON', low: '10', mid: '25', high: '50' },
	{ key: 'H2', name: 'ASTRONAUT HELMET', low: '3', mid: '10', high: '25' },
	{ key: 'H3', name: 'RINGED PLANET', low: '2', mid: '5', high: '15' },
	{ key: 'H4', name: 'ROCKET', low: '1.5', mid: '3', high: '12' },
	{ key: 'L1', name: 'AMBER GEM', low: '0.8', mid: '1.5', high: '2.5' },
	{ key: 'L2', name: 'CRIMSON GEM', low: '0.6', mid: '1.2', high: '2' },
	{ key: 'L3', name: 'TEAL GEM', low: '0.5', mid: '1', high: '1.8' },
	{ key: 'L4', name: 'BLUE GEM', low: '0.4', mid: '0.8', high: '1.5' },
	{ key: 'L5', name: 'VIOLET GEM', low: '0.2', mid: '0.6', high: '1.2' },
];

const PAY_SYMBOL_COLUMNS = 3;

const payRows = (symbol: PaySymbol) =>
	`12+\t|\t${symbol.high}x\n10-11\t|\t${symbol.mid}x\n8-9\t|\t${symbol.low}x`;

const gameRuleMeta: GameRuleMeta = {
	payTable: [
		{
			title: 'SYMBOLS',
			rows: Math.ceil(PAY_SYMBOLS.length / PAY_SYMBOL_COLUMNS),
			columns: PAY_SYMBOL_COLUMNS,
			containers: PAY_SYMBOLS.map((symbol, index) => ({
				title: symbol.name,
				text: payRows(symbol),
				image: symbolImage(symbol.key),
				imagePosition: 'top' as const,
				row: Math.floor(index / PAY_SYMBOL_COLUMNS),
				column: index % PAY_SYMBOL_COLUMNS,
			})),
		},
		{
			title: 'SPECIAL SYMBOLS',
			rows: 2,
			columns: 1,
			containers: [
				{
					title: 'WORMHOLE PORTAL',
					text: 'The Wormhole Portal is the Scatter symbol. It pays anywhere on the grid on its own, on top of triggering FREE SPINS.\n\n6+\t|\t100x\n5\t|\t10x\n4\t|\t4x',
					image: symbolImage('S'),
					imagePosition: 'left' as const,
					row: 0,
					column: 0,
				},
				{
					title: 'COSMIC METEOR',
					text: 'The Cosmic Meteor appears during FREE SPINS only and carries a multiplier value of 2x, 3x, 4x, 5x, 6x, 8x, 10x, 12x, 15x, 20x, 25x, 50x or 100x.\n\nAll Cosmic Meteor values on the board are added together, and the total multiplies the full cascade payout for that spin.',
					image: symbolImage('M'),
					imagePosition: 'left' as const,
					row: 1,
					column: 0,
				},
			],
		},
		{
			title: 'PAY ANYWHERE',
			rows: 1,
			columns: 1,
			containers: [
				{
					title: '',
					text: 'The grid is 6 reels by 5 rows and pays anywhere. 8 or more matching symbols anywhere on the grid pay, regardless of their position — the symbols do not need to be adjacent or on a line.\n\nPayouts are grouped into three count tiers: 8-9, 10-11 and 12 or more matching symbols. All values in the paytable are multiples of the total bet.\n\nThere is no Wild symbol in this game.',
					image: '',
					imagePosition: 'top' as const,
					row: 0,
					column: 0,
				},
			],
		},
		{
			title: 'TUMBLE',
			rows: 1,
			columns: 1,
			containers: [
				{
					title: '',
					text: 'After a win is paid, the winning symbols are removed from the grid. The remaining symbols fall down to fill the gaps and new symbols drop in from above, then the grid is evaluated again.\n\nThis repeats for as long as new wins keep forming, so a single spin can chain multiple cascades.',
					image: '',
					imagePosition: 'top' as const,
					row: 0,
					column: 0,
				},
			],
		},
	],
	gameRules: [
		{
			title: 'FREE SPINS',
			rows: 3,
			columns: 1,
			containers: [
				{
					title: 'TRIGGER',
					text: 'Landing Wormhole Portal Scatters in a spin sequence triggers FREE SPINS.\n\n4 Scatters award 10 FREE SPINS.\n5 Scatters award 12 FREE SPINS.\n6 or more Scatters award 15 FREE SPINS.\n\nThe Scatters also pay their own value on top of triggering the feature.',
					image: symbolImage('S'),
					imagePosition: 'left' as const,
					row: 0,
					column: 0,
				},
				{
					title: 'RETRIGGER',
					text: 'During FREE SPINS, landing Wormhole Portal Scatters awards additional FREE SPINS.\n\n3 Scatters award 5 additional FREE SPINS.\n4 Scatters award 8 additional FREE SPINS.\n5 or more Scatters award 10 additional FREE SPINS.',
					image: symbolImage('S'),
					imagePosition: 'left' as const,
					row: 1,
					column: 0,
				},
				{
					title: 'COSMIC METEOR',
					text: 'Cosmic Meteor symbols appear during FREE SPINS only, each carrying a multiplier value of 2x, 3x, 4x, 5x, 6x, 8x, 10x, 12x, 15x, 20x, 25x, 50x or 100x.\n\nEvery Cosmic Meteor value on the board is added together, and the total multiplies the full cascade payout for that spin.',
					image: symbolImage('M'),
					imagePosition: 'left' as const,
					row: 2,
					column: 0,
				},
			],
		},
		{
			title: 'BET MODES',
			rows: 1,
			columns: 1,
			containers: [
				{
					title: '',
					text: 'The normal mode of this game has a theoretical expected return of 96.5%.\n\nThe player also has the option to activate DOUBLE CHANCE. This costs 1.25x the underlying bet and roughly doubles the chance of triggering FREE SPINS. DOUBLE CHANCE remains active until disabled by the player and has a theoretical expected return of 96.5%.\n\nThe player also has the option to buy FREE SPINS. This costs 100x the underlying bet and instantly triggers the FREE SPINS feature. The FREE SPINS buy mode has a theoretical expected return of 96.5%.\n\nThis game is high volatility. The maximum win in each bet mode is capped at 20,000x the underlying bet.',
					image: '',
					imagePosition: 'top' as const,
					row: 0,
					column: 0,
				},
			],
		},
		{
			title: 'LEGAL NOTICE',
			rows: 1,
			columns: 1,
			containers: [
				{
					title: '',
					text: 'Malfunction voids all pays and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted bets. The theoretical expected return is calculated over many spins. Movement of reels are not representative of any physical device, and is for illustrative purposes only.',
					image: '',
					imagePosition: 'top' as const,
					row: 0,
					column: 0,
				},
			],
		},
	],
	splashScreen: [],
};

// ---------------------------------------------------------------------------

/**
 * Overrides the `state-shared` sample metadata. Called at module scope below so the override is
 * in place as soon as this module is imported — before any component (including
 * components-shared Authenticate.svelte, which can write `stateBet.activeBetModeKey` from a
 * resumed round) renders.
 */
export const setGameMeta = () => {
	stateMeta.betModeMeta = betModeMeta;
	stateMeta.gameRuleMeta = gameRuleMeta;
};

setGameMeta();
