<script lang="ts" module>
	export type EmitterEventFreeSpinCounter =
		| { type: 'freeSpinCounterShow' }
		| { type: 'freeSpinCounterHide' }
		| { type: 'freeSpinCounterUpdate'; current?: number; total?: number };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { BitmapText } from 'pixi-svelte';

	import TumbleWinAmountFrame from './TumbleWinAmountFrame.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	// Same gold plate as the tumble win / multiplier counters (see MOCHI_UI_PLAN.md).
	// Sits just outside the reel frame's left edge, near the top of the board.
	const PLATE_HEIGHT = SYMBOL_SIZE * 0.8;
	const PLATE_WIDTH = PLATE_HEIGHT * (400 / 144);
	const scale = 1;
	const position = $derived({
		x:
			context.stateGameDerived.boardLayout().x -
			context.stateGameDerived.boardLayout().width * 0.5 -
			PLATE_WIDTH * 0.5 -
			SYMBOL_SIZE * 0.3,
		y:
			context.stateGameDerived.boardLayout().y -
			context.stateGameDerived.boardLayout().height * 0.5 +
			SYMBOL_SIZE * 0.55,
	});

	let show = $state(false);
	let current = $state(0);
	let total = $state(0);

	context.eventEmitter.subscribeOnMount({
		freeSpinCounterShow: () => (show = true),
		freeSpinCounterHide: () => (show = false),
		freeSpinCounterUpdate: (emitterEvent) => {
			if (emitterEvent.current !== undefined) current = emitterEvent.current;
			if (emitterEvent.total !== undefined) total = emitterEvent.total;
		},
	});
</script>

<MainContainer>
	<FadeContainer {show} {...position} {scale}>
		<TumbleWinAmountFrame title="FREE SPIN">
			{#snippet children({ frameSizes })}
				<BitmapText
					anchor={0.5}
					text={`${current} OF ${total}`}
					style={{
						fontFamily: 'gold',
						fontSize: frameSizes.height * 0.4,
					}}
				/>
			{/snippet}
		</TumbleWinAmountFrame>
	</FadeContainer>
</MainContainer>
