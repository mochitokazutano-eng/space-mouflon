<script lang="ts" module>
	export type EmitterEventGlobalMultiplier =
		| { type: 'globalMultiplierShow' }
		| { type: 'globalMultiplierHide' }
		| { type: 'globalMultiplierUpdate'; multiplier: number };
</script>

<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';

	import { BitmapText, Container } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import TumbleWinAmountFrame from './TumbleWinAmountFrame.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	// Same plate as the tumble win counter; right edge aligned to the reel frame's
	// right edge, mirroring the tumble win plate on the left (see MOCHI_UI_PLAN.md).
	const PLATE_HEIGHT = SYMBOL_SIZE * 0.8;
	const PLATE_WIDTH = PLATE_HEIGHT * (400 / 144);
	const context = getContext();
	const scale = $derived(context.stateLayoutDerived.isStacked() ? 1.28 : 1);
	const desktopPosition = $derived({
		x: context.stateGameDerived.boardLayout().width - PLATE_WIDTH * 0.5,
		y: -PLATE_HEIGHT * 0.58,
	});
	const portraitPosition = $derived({
		x: context.stateGameDerived.boardLayout().width - PLATE_WIDTH * 0.5 * 1.28,
		y: -PLATE_HEIGHT * 0.68,
	});
	const position = $derived(
		context.stateLayoutDerived.isStacked() ? portraitPosition : desktopPosition,
	);

	let show = $state(false);
	let multiplier = $state(1);
	// Replaces the sample frame's increment/reset Spine animations. The update sequence used
	// to await the Spine's `complete`; it now awaits this pop settling, so nothing hangs.
	const pop = new Tween(1);

	context.eventEmitter.subscribeOnMount({
		globalMultiplierShow: () => (show = true),
		globalMultiplierHide: () => (show = false),
		globalMultiplierUpdate: async (emitterEvent) => {
			const isReset = emitterEvent.multiplier === 1 && multiplier !== 1;
			const isIncrement = emitterEvent.multiplier > multiplier;

			if (isReset) {
				await waitForTimeout(300);
			}

			if (isReset || isIncrement) {
				multiplier = emitterEvent.multiplier;
				await pop.set(1.35, { duration: 140, easing: backOut });
				await pop.set(1, { duration: 220, easing: cubicOut });
			}
		},
	});
</script>

<FadeContainer {show}>
	<BoardContainer>
		<Container {...position} {scale}>
			<TumbleWinAmountFrame title="MULTIPLIER">
				{#snippet children({ frameSizes })}
					<BitmapText
						anchor={0.5}
						scale={pop.current}
						text={`${multiplier}×`}
						style={{
							fontFamily: 'gold',
							fontSize: frameSizes.height * 0.5,
						}}
					/>
				{/snippet}
			</TumbleWinAmountFrame>
		</Container>
	</BoardContainer>
</FadeContainer>
