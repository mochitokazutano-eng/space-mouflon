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
	import Panel from './Panel.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, GOLD_TEXT_TINT } from '../game/constants';

	const PANEL_WIDTH = SYMBOL_SIZE * 0.641;
	const PANEL_SIZES = { width: PANEL_WIDTH * 1.5, height: PANEL_WIDTH * 1.05 };
	const context = getContext();
	const scale = $derived(context.stateLayoutDerived.isStacked() ? 1.28 : 1);
	const desktopPosition = $derived({
		x: context.stateGameDerived.boardLayout().width - PANEL_WIDTH * 1.3,
		y: -SYMBOL_SIZE * 0.47,
	});
	const portraitPosition = $derived({
		x: context.stateGameDerived.boardLayout().width - PANEL_WIDTH * 1.5,
		y: -SYMBOL_SIZE * 0.55,
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
			<Panel
				anchor={0.5}
				width={PANEL_SIZES.width}
				height={PANEL_SIZES.height}
				borderRadius={12}
				borderWidth={3}
			/>
			<BitmapText
				anchor={0.5}
				scale={pop.current}
				tint={GOLD_TEXT_TINT}
				text={`${multiplier}×`}
				style={{
					fontFamily: 'gold',
					fontSize: PANEL_WIDTH * 0.52,
				}}
			/>
		</Container>
	</BoardContainer>
</FadeContainer>
