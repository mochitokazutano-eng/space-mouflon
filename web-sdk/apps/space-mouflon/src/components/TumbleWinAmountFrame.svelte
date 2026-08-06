<script lang="ts">
	import type { Snippet } from 'svelte';

	import { BitmapText, Sprite, type Sizes } from 'pixi-svelte';

	import { SYMBOL_SIZE, GOLD_TEXT_TINT } from '../game/constants';

	type Props = {
		children: Snippet<[{ frameSizes: Sizes }]>;
	};

	const props: Props = $props();

	// Our navy plate replaces the sample's wooden panel. The footprint is unchanged — the win
	// amount and the burst spine are both sized off this width.
	const PANEL_KEY = 'plateValue';
	const PANEL_RATIO = 400 / 144;
	const PANEL_HEIGHT = SYMBOL_SIZE * 0.8;
	const PANEL_SIZES = {
		width: PANEL_HEIGHT * PANEL_RATIO,
		height: PANEL_HEIGHT,
	};

	// The sample's wooden title plate is dropped: plate_name.png is the branded "SPACE MOUFLON"
	// lockup rather than a blank label plate, so the gold label sits straight above the panel.
	const TITLE_HEIGHT = SYMBOL_SIZE * 0.28;
</script>

<Sprite anchor={0.5} key={PANEL_KEY} {...PANEL_SIZES} />

<BitmapText
	anchor={{ x: 0.5, y: 1 }}
	y={-PANEL_SIZES.height * 0.5 - TITLE_HEIGHT * 0.2}
	text="TUMBLE WIN"
	style={{ fontFamily: 'gold', fontSize: TITLE_HEIGHT * 0.8 }}
/>

{@render props.children({ frameSizes: PANEL_SIZES })}
