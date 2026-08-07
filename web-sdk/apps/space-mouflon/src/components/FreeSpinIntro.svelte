<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { CanvasSizeRectangle } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { waitForResolve } from 'utils-shared/wait';
	import { BitmapText } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import PressToContinue from './PressToContinue.svelte';
	import FreeSpinAnimation from './FreeSpinAnimation.svelte';
	import { GOLD_TEXT_TINT } from '../game/constants';

	const context = getContext();

	let show = $state(false);
	let freeSpinsFromEvent = $state(0);
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => (show = true),
		freeSpinIntroHide: () => (show = false),
		freeSpinIntroUpdate: async (emitterEvent) => {
			// if (emitterEvent.extraSpins) {
			// }
			// freeSpinsFromEvent = emitterEvent.extraSpins ?? emitterEvent.totalFreeSpins;
			freeSpinsFromEvent = emitterEvent.totalFreeSpins;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<FadeContainer {show}>
	<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.5} />

	<FreeSpinAnimation>
		{#snippet children({ sizes })}
			<BitmapText
				anchor={{ x: 0.5, y: 1 }}
				y={-sizes.height * 0.5 - 10}
				text="YOU WON"
				style={{ fontFamily: 'gold', fontSize: sizes.height * 0.3 }}
			/>

			<!-- The fsIntroNumber spine carried the sample's wooden plaque as well as the number,
			     so the number is drawn directly instead. -->
			<BitmapText
				anchor={{ x: 0.5, y: 0.5 }}
				text={freeSpinsFromEvent}
				style={{
					fontFamily: 'gold',
					fontSize: sizes.height * 0.55,
					fontWeight: 'bold',
				}}
			/>

			<BitmapText
				anchor={{ x: 0.5, y: 0 }}
				y={sizes.height * 0.5 + 10}
				text="FREE SPINS"
				style={{ fontFamily: 'gold', fontSize: sizes.height * 0.26 }}
			/>
		{/snippet}
	</FreeSpinAnimation>

	<PressToContinue onpress={() => oncomplete()} />
</FadeContainer>
