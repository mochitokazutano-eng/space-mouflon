<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { onMount } from 'svelte';

	import { getSymbolInfo } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
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
