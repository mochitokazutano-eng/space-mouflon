<script lang="ts">
	import type { Snippet } from 'svelte';

	import { BitmapText, Sprite, type Sizes } from 'pixi-svelte';

	import { SYMBOL_SIZE } from '../game/constants';

	type Props = {
		title?: string;
		children: Snippet<[{ frameSizes: Sizes }]>;
	};

	const props: Props = $props();

	// Shared gold plate for every board-top counter (tumble win, multiplier, free spins):
	// one visual language across the three plates (see MOCHI_UI_PLAN.md).
	const PANEL_KEY = 'plateValue';
	const PANEL_RATIO = 400 / 144;
	const PANEL_HEIGHT = SYMBOL_SIZE * 0.8;
	const PANEL_SIZES = {
		width: PANEL_HEIGHT * PANEL_RATIO,
		height: PANEL_HEIGHT,
	};

	const TITLE_HEIGHT = SYMBOL_SIZE * 0.28;
</script>

<Sprite anchor={0.5} key={PANEL_KEY} {...PANEL_SIZES} />

<BitmapText
	anchor={{ x: 0.5, y: 1 }}
	y={-PANEL_SIZES.height * 0.5 - TITLE_HEIGHT * 0.2}
	text={props.title ?? 'TUMBLE WIN'}
	style={{ fontFamily: 'gold', fontSize: TITLE_HEIGHT * 0.8 }}
/>

{@render props.children({ frameSizes: PANEL_SIZES })}
