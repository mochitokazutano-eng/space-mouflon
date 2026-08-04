<script lang="ts" module>
	export type EmitterEventFreeSpinRetrigger = {
		type: 'freeSpinRetriggerShow';
		amount: number;
	};
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

	// A retrigger happens mid-feature, so this is a short on-board beat rather than the
	// full-screen FreeSpinIntro: pop in, hold, fade out. No PressToContinue, no ui hide.
	const HOLD_DURATION = 700;
	const FADE_DURATION = 220;

	const PANEL_SIZES = { width: SYMBOL_SIZE * 3.2, height: SYMBOL_SIZE * 0.95 };
	const context = getContext();

	const position = $derived({
		x: context.stateGameDerived.boardLayout().width * 0.5,
		y: context.stateGameDerived.boardLayout().height * 0.5,
	});

	let show = $state(false);
	let amount = $state(0);
	const pop = new Tween(1);

	context.eventEmitter.subscribeOnMount({
		freeSpinRetriggerShow: async (emitterEvent) => {
			amount = emitterEvent.amount;
			show = true;
			await pop.set(1.12, { duration: 160, easing: backOut });
			await pop.set(1, { duration: 200, easing: cubicOut });
			await waitForTimeout(HOLD_DURATION);
			show = false;
			await waitForTimeout(FADE_DURATION);
		},
	});
</script>

<FadeContainer {show} duration={FADE_DURATION}>
	<BoardContainer>
		<Container {...position} scale={pop.current}>
			<Panel
				anchor={0.5}
				width={PANEL_SIZES.width}
				height={PANEL_SIZES.height}
				borderRadius={16}
				borderWidth={3}
			/>
			<BitmapText
				anchor={0.5}
				tint={GOLD_TEXT_TINT}
				text={`+${amount} FREE SPINS`}
				style={{
					fontFamily: 'gold',
					fontSize: PANEL_SIZES.height * 0.42,
					wordWrap: false,
				}}
			/>
		</Container>
	</BoardContainer>
</FadeContainer>
