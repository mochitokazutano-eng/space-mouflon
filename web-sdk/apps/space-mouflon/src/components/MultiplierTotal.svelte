<script lang="ts" module>
	export type EmitterEventMultiplierTotal =
		| { type: 'multiplierTotalShow' }
		| { type: 'multiplierTotalHide' }
		| { type: 'multiplierTotalUpdate'; totalMultiplier: number }
		| { type: 'multiplierTotalAnimate' };
</script>

<script lang="ts">
	import { BitmapText, Container } from 'pixi-svelte';
	import { waitForResolve } from 'utils-shared/wait';
	import { stateBetDerived } from 'state-shared';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, GOLD_TEXT_TINT } from '../game/constants';
	import { runTimeline, ramp, rampOut } from '../game/timeline.svelte';
	import BoardContainer from './BoardContainer.svelte';
	import RadialRays from './RadialRays.svelte';
	import Burst from './Burst.svelte';

	// Beat map lifted from the tumble_multiplier rig this replaces:
	//   0.000 -> 0.233  badge pops 0.55x -> 1.0x
	//   0.233 -> 0.333  holds
	//   0.333 -> 0.533  shrinks to 0.5x
	//   0.533 -> 0.667  eases back to 0.55x
	//   0.667 -> 0.867  holds
	//   0.867 -> 1.123  grows to 0.7x
	//   1.033 -> 1.533  travels upward (the rig moved it 515 units in +y, which
	//                   is up in Spine and therefore negative y in Pixi)
	//   1.533 -> 1.800  fades out
	//   1.800           animation ends -> oncomplete
	const DURATION = 1.8;
	const IDLE_SCALE = 0.55;

	const context = getContext();
	let show = $state(false);
	let totalMultiplier = $state(0);
	let oncomplete = $state(() => {});
	let t = $state(0);

	// `animating` deliberately stays true once the animation has run: the rig it
	// replaces held its end pose (badge flown off, faded) until multiplierTotalHide
	// arrived. Resetting would pop the badge back to the middle of the board.
	// `playCount` is what restarts it, so a second animate on the same mount
	// re-runs the timeline instead of being swallowed as "no change".
	let animating = $state(false);
	let playCount = $state(0);

	context.eventEmitter.subscribeOnMount({
		multiplierTotalShow: () => (show = true),
		multiplierTotalHide: () => {
			show = false;
			animating = false;
			t = 0;
		},
		multiplierTotalUpdate: (emitterEvent) => (totalMultiplier = emitterEvent.totalMultiplier),
		multiplierTotalAnimate: async () => {
			animating = true;
			playCount += 1;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	$effect(() => {
		// read both so the effect restarts on every animate call
		playCount;
		if (!animating) {
			t = 0;
			return;
		}
		t = 0;
		return runTimeline((v) => (t = v), {
			duration: DURATION,
			timeScale: () => stateBetDerived.timeScale(),
			oncomplete: () => oncomplete(),
		});
	});

	const badgeScale = $derived(
		!animating
			? IDLE_SCALE
			: t < 0.2333
				? rampOut(t, 0, 0.2333, 0.55, 1)
				: t < 0.3333
					? 1
					: t < 0.5333
						? rampOut(t, 0.3333, 0.5333, 1, 0.5)
						: t < 0.6667
							? rampOut(t, 0.5333, 0.6667, 0.5, 0.55)
							: t < 0.8667
								? 0.55
								: rampOut(t, 0.8667, 1.1233, 0.55, 0.7),
	);

	const boardHeight = $derived(context.stateGameDerived.boardLayout().height);
	const badgeY = $derived(animating ? ramp(t, 1.0333, 1.5333, 0, -boardHeight * 0.95) : 0);
	const badgeAlpha = $derived(animating ? ramp(t, 1.5333, DURATION, 1, 0) : 1);

	// The rig flashed its radial bones in over the first beat and out with the
	// badge; the burst covers the moment the badge lands at full size.
	const raysAlpha = $derived(
		!animating ? 0 : ramp(t, 0, 0.18, 0, 1) * ramp(t, 1.0333, 1.45, 1, 0),
	);
	const burstProgress = $derived(animating ? (t - 0.12) / 0.75 : 0);

	const boardWidth = $derived(context.stateGameDerived.boardLayout().width);
</script>

{#snippet multiplierSnippet(alpha: number, scale: number)}
	<Container {alpha} {scale}>
		<BitmapText
			tint={GOLD_TEXT_TINT}
			anchor={0.5}
			text={`${totalMultiplier} X`}
			style={{
				fontFamily: 'gold',
				fontSize: SYMBOL_SIZE,
				letterSpacing: -5,
			}}
		/>
	</Container>
{/snippet}

{#if show}
	<BoardContainer>
		<Container x={boardWidth * 0.5} y={boardHeight * 0.5 + badgeY} alpha={badgeAlpha}>
			{#if raysAlpha > 0.01}
				<RadialRays time={t} radius={boardWidth * 0.42} alpha={raysAlpha} />
			{/if}

			<Burst progress={burstProgress} radius={boardWidth * 0.34} shards={18} embers={26} />

			<!-- soft bloom copy behind the badge, standing in for the rig's
			     additive `tumblemultiplier_add` slot -->
			{@render multiplierSnippet(0.45, badgeScale * 3 * 1.08)}
			{@render multiplierSnippet(1, badgeScale * 3)}
		</Container>
	</BoardContainer>
{/if}
