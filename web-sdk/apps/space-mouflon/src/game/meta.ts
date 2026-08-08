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
const symbolImage = (key: string) => `./assets/sprites/mouflon/${key}.png`;

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
			description: 'About double the chance to trigger FREE SPINS.',
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

// U+2007 FIGURE SPACE is digit-width, so padding the tier label with it keeps the two
// columns aligned in a proportional font. Tabs did not: '10-11' is wider than '12+', so its
// tab collapsed to nothing and the rows came out ragged.
const FIGURE_SPACE = '\u2007';
const payRow = (tier: string, value: string) => `${tier.padEnd(7, FIGURE_SPACE)}${value}x`;
const payRows = (symbol: PaySymbol) =>
	[payRow('12+', symbol.high), payRow('10-11', symbol.mid), payRow('8-9', symbol.low)].join('\n');

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
					title: 'GALACTIC STAR',
					text: `The Galactic Star is the Scatter symbol. It pays anywhere on the grid on its own, on top of triggering FREE SPINS.\n\n${payRow('6+', '100')}\n${payRow('5', '10')}\n${payRow('4', '4')}`,
					image: symbolImage('S'),
					imagePosition: 'left' as const,
					row: 0,
					column: 0,
				},
				{
					title: 'COSMIC METEOR',
					text: 'Cosmic Meteors land during FREE SPINS only. Each one carries a multiplier of 2x, 3x, 4x, 5x, 6x, 8x, 10x, 12x, 15x, 20x, 25x, 50x or 100x.\n\nAll Meteor values on the board are added together, and the total multiplies the whole cascade payout for that spin.',
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
					text: 'The grid is 6 reels by 5 rows and pays anywhere. Land 8 or more matching symbols anywhere on the grid to win. They do not need to be adjacent or sit on a payline.\n\nPayouts come in three tiers: 8 to 9, 10 to 11, and 12 or more matching symbols. Every paytable value is a multiple of the total bet.\n\nThis game has no Wild symbol.',
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
					text: 'Winning symbols are removed once they pay. The symbols above them fall to fill the gaps, new symbols drop in from the top, and the grid pays again.\n\nThis keeps running while new wins keep landing, so one spin can chain a long run of tumbles.',
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
					text: 'Galactic Star Scatters landing in one spin sequence trigger FREE SPINS.\n\n4 Scatters award 10 FREE SPINS.\n5 Scatters award 12 FREE SPINS.\n6 or more Scatters award 15 FREE SPINS.\n\nScatters pay their own value as well when they trigger the feature.',
					image: symbolImage('S'),
					imagePosition: 'left' as const,
					row: 0,
					column: 0,
				},
				{
					title: 'RETRIGGER',
					text: 'During FREE SPINS, landing Galactic Star Scatters awards additional FREE SPINS.\n\n3 Scatters award 5 additional FREE SPINS.\n4 Scatters award 8 additional FREE SPINS.\n5 or more Scatters award 10 additional FREE SPINS.',
					image: symbolImage('S'),
					imagePosition: 'left' as const,
					row: 1,
					column: 0,
				},
				{
					title: 'COSMIC METEOR',
					text: 'Cosmic Meteors land during FREE SPINS only. Each one carries a multiplier of 2x, 3x, 4x, 5x, 6x, 8x, 10x, 12x, 15x, 20x, 25x, 50x or 100x.\n\nAll Meteor values on the board are added together, and the total multiplies the whole cascade payout for that spin.',
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
			title: 'UI GUIDE',
			rows: 10,
			columns: 1,
			containers: [
				{
					title: 'SPIN',
					text: 'Starts a spin at the current bet. SPACEBAR spins as well.',
					image: './assets/ui/mouflon-ui/btn_spin.png',
					imagePosition: 'left',
					row: 0,
					column: 0,
				},
				{
					title: 'BET PLUS AND MINUS',
					text: 'Raises or lowers the total bet. Every bet level is selectable.',
					image: './assets/ui/mouflon-ui/btn_plus.png',
					imagePosition: 'left',
					row: 1,
					column: 0,
				},
				{
					title: 'DOUBLE CHANCE',
					text: 'Turns on DOUBLE CHANCE at 1.25x the bet. The toggle lights up while it is on.',
					image: './assets/ui/mouflon-ui/toggle_ante_on.png',
					imagePosition: 'left',
					row: 2,
					column: 0,
				},
				{
					title: 'BONUS BUY',
					text: 'Opens the BONUS BUY offer at 100x the bet. You confirm before any purchase.',
					image: './assets/ui/mouflon-ui/btn_bonus.png',
					imagePosition: 'left',
					row: 3,
					column: 0,
				},
				{
					title: 'AUTOPLAY',
					text: 'Sets a number of automatic spins. Autoplay asks you to confirm before it starts.',
					image: './assets/ui/mouflon-ui/icon_auto.png',
					imagePosition: 'left',
					row: 4,
					column: 0,
				},
				{
					title: 'TURBO',
					text: 'Speeds up spins and animations. All values stay readable in turbo.',
					image: './assets/ui/mouflon-ui/icon_bolt.png',
					imagePosition: 'left',
					row: 5,
					column: 0,
				},
				{
					title: 'SOUND',
					text: 'Turns all game audio on and off. The icon changes while muted.',
					image: './assets/ui/mouflon-ui/icon_sound_on.png',
					imagePosition: 'left',
					row: 6,
					column: 0,
				},
				{
					title: 'PAYTABLE',
					text: 'Opens the paytable with every symbol payout and the special symbol rules.',
					image: './assets/ui/mouflon-ui/icon_paytable.png',
					imagePosition: 'left',
					row: 7,
					column: 0,
				},
				{
					title: 'GAME RULES',
					text: 'Opens these rules at any time during play.',
					image: './assets/ui/mouflon-ui/icon_info.png',
					imagePosition: 'left',
					row: 8,
					column: 0,
				},
				{
					title: 'MENU AND TICKERS',
					text: 'The menu holds settings and rules. The bottom bar always shows BALANCE, BET and WIN. Win values count up as each tumble pays.',
					image: './assets/ui/mouflon-ui/icon_menu.png',
					imagePosition: 'left',
					row: 9,
					column: 0,
				},
			],
		}, {
			title: 'LEGAL NOTICE',
			rows: 1,
			columns: 1,
			containers: [
				{
					title: '',
					text: 'Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2025 Stake Engine.',
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
