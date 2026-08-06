<script lang="ts">
	import { BitmapText } from 'pixi-svelte';

	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSpriteAnimated from './anim/SymbolSpriteAnimated.svelte';
	import { getSymbolBackgroundInfo, getSymbolInfo } from '../game/utils';
	import { METEOR_VALUE_FONT_SIZE, METEOR_VALUE_OFFSET, GOLD_TEXT_TINT } from '../game/constants';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { getContext } from '../game/context';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');
	const isMeteor = $derived(['M', 'M_TAKEN'].includes(props.rawSymbol.name));
</script>

{#if isSprite}
	<SymbolSpriteAnimated
		{symbolInfo}
		x={props.x}
		y={props.y}
		state={props.state}
		name={props.rawSymbol.name}
		oncomplete={props.oncomplete}
	/>
{:else}
	{@const symbolBackgroundInfo = getSymbolBackgroundInfo({
		rawSymbol: props.rawSymbol,
		state: props.state,
	})}
	<SymbolSpine
		loop={props.loop}
		{symbolInfo}
		{symbolBackgroundInfo}
		x={props.x}
		y={props.y}
		showWinFrame={props.state === 'win' && !['S', 'M'].includes(props.rawSymbol.name)}
		listener={{
			complete: props.oncomplete,
		}}
	/>
{/if}

{#if isMeteor && props.rawSymbol.multiplier !== undefined && props.state !== 'explosion'}
	<BitmapText
		x={(props.x ?? 0) + METEOR_VALUE_OFFSET.x}
		y={(props.y ?? 0) + METEOR_VALUE_OFFSET.y}
		anchor={0.5}
		text={`${props.rawSymbol.multiplier}×`}
		style={{ fontFamily: 'gold', fontSize: METEOR_VALUE_FONT_SIZE }}
	/>
{/if}
