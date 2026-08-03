<script lang="ts">
	import { BitmapText, Sprite } from 'pixi-svelte';
	import { onMount } from 'svelte';

	import { getSymbolInfo } from '../game/utils';
	import { METEOR_VALUE_FONT_SIZE, SYMBOL_SIZE, GOLD_TEXT_TINT } from '../game/constants';
	import type { MultiplierSymbol } from '../game/stateGame.svelte';

	type Props = {
		reelIndex: number;
		multiplierSymbol: MultiplierSymbol;
	};

	const props: Props = $props();

	const symbolInfo = $derived(
		getSymbolInfo({
			rawSymbol: props.multiplierSymbol.rawSymbol,
			state: props.multiplierSymbol.symbolState,
		}),
	);

	onMount(() => {
		props.multiplierSymbol.oncomplete?.();
	});

	$effect(() => {
		symbolInfo;
		props.multiplierSymbol.oncomplete?.();
	});
</script>

<Sprite
	x={props.multiplierSymbol.symbolX.current}
	y={props.multiplierSymbol.symbolY.current}
	anchor={0.5}
	key={symbolInfo.assetKey}
	width={SYMBOL_SIZE * symbolInfo.sizeRatios.width}
	height={SYMBOL_SIZE * symbolInfo.sizeRatios.height}
/>

{#if props.multiplierSymbol.rawSymbol.multiplier !== undefined}
	<BitmapText
		tint={GOLD_TEXT_TINT}
		x={props.multiplierSymbol.symbolX.current}
		y={props.multiplierSymbol.symbolY.current}
		anchor={0.5}
		text={`${props.multiplierSymbol.rawSymbol.multiplier}×`}
		style={{ fontFamily: 'gold', fontSize: METEOR_VALUE_FONT_SIZE }}
	/>
{/if}
