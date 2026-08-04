<script lang="ts">
	import { type SpineTrackProps } from 'pixi-svelte';

	import { SYMBOL_SIZE } from '../game/constants';
	import { getSymbolBackgroundInfo, getSymbolInfo } from '../game/utils';
	import SymbolSpineMain from './SymbolSpineMain.svelte';
	import SymbolSpineBackground from './SymbolSpineBackground.svelte';
	import WinFrame from './WinFrame.svelte';

	type Props = {
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		symbolBackgroundInfo: ReturnType<typeof getSymbolBackgroundInfo>;
		x?: number;
		y?: number;
		listener: SpineTrackProps['listener'];
		showWinFrame: boolean;
		loop?: boolean;
	};

	const props: Props = $props();
</script>

<SymbolSpineBackground
	x={props.x}
	y={props.y}
	symbolBackgroundInfo={props.symbolBackgroundInfo}
	loop={props.loop}
/>

<!-- main -->
<SymbolSpineMain
	x={props.x}
	y={props.y}
	symbolInfo={props.symbolInfo}
	listener={props.listener}
	loop={props.loop}
/>

<!-- tumble frame -->
{#if props.showWinFrame}
	<WinFrame x={props.x} y={props.y} size={SYMBOL_SIZE} />
{/if}
