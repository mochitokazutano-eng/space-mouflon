/**
 * Pixi assets shared by the UI layer (components-ui-pixi).
 *
 * `UiSprite` keys its <Sprite> off this map, so every key here is a skinnable slot of the
 * pixi UI. A slot with no entry falls back to the SDK's drawn <Rectangle>.
 *
 * Apps spread this into their own asset map so the loader picks the art up — see
 * apps/space-mouflon/src/game/assets.ts.
 *
 * The files are served from the game's `static/` dir (root-absolute paths) rather than
 * imported from this package, matching how the rest of the game's art is loaded. Bundling
 * them through `new URL(..., import.meta.url)` from here does not work: the dev server
 * refuses raw files outside the app root (fs.allow), and config-vite inlines every
 * pipeline asset (assetsInlineLimit: Infinity).
 */
const UI_ART_DIR = '/assets/ui/mouflon-ui';

export const sharedAssetsPixi = {
	// spin button
	bet: {
		type: 'sprite',
		src: `${UI_ART_DIR}/btn_spin.png`,
	},
	// balance / win / bet ticker plate
	base_ticker: {
		type: 'sprite',
		src: `${UI_ART_DIR}/plate_value.png`,
	},
	// generic button pills — inactive / active
	ui_pill_off: {
		type: 'sprite',
		src: `${UI_ART_DIR}/pill_off.png`,
	},
	ui_pill_on: {
		type: 'sprite',
		src: `${UI_ART_DIR}/pill_on.png`,
	},
	// button icons
	ui_icon_increase: {
		type: 'sprite',
		src: `${UI_ART_DIR}/btn_plus.png`,
	},
	ui_icon_decrease: {
		type: 'sprite',
		src: `${UI_ART_DIR}/btn_minus.png`,
	},
	ui_icon_menu: {
		type: 'sprite',
		src: `${UI_ART_DIR}/icon_menu.png`,
	},
	ui_icon_turbo: {
		type: 'sprite',
		src: `${UI_ART_DIR}/icon_bolt.png`,
	},
	ui_icon_autospin: {
		type: 'sprite',
		src: `${UI_ART_DIR}/icon_auto.png`,
	},
	ui_icon_info: {
		type: 'sprite',
		src: `${UI_ART_DIR}/icon_info.png`,
	},
	ui_icon_sound: {
		type: 'sprite',
		src: `${UI_ART_DIR}/icon_sound.png`,
	},
	// plate_name.png ships in the art dir too, but it is the branded "SPACE MOUFLON" lockup
	// rather than a blank plate, so no button slot uses it — register it when the game-name
	// slot wants it.
} as const;

export type SharedAssetPixiKey = keyof typeof sharedAssetsPixi;
