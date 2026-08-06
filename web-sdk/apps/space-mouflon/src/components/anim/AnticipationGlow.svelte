<script lang="ts">
	/**
	 * WS-B — code-driven anticipation (drop-in for the deleted spine rig).
	 * Same contract as the sample Anticipation.svelte: props {reel, oncomplete};
	 * intro -> loop while the reel spins, out -> oncomplete when
	 * reel.reelState.motion === 'stopped'. Pairs with the existing
	 * sfx_anticipation loop already broadcast by Anticipations.svelte.
	 * Visual: rising additive glow column over the reel + climbing sparkles.
	 */
	import { onDestroy } from 'svelte';
	import { Container, Rectangle } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';

	import FxOnce from './FxOnce.svelte';
	import { tween, loopTween, trigHash, easeOutCubic } from './timeline';
	import { getContext } from '../../game/context';
	import { REEL_PADDING, SYMBOL_SIZE } from '../../game/constants';
	import type { Reel } from '../../game/stateGame.svelte';

	type Props = {
		reel: Reel;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();
	const timeScale = () => stateBetDerived.timeScale();

	const layout = $derived(context.stateGameDerived.boardLayout());
	const colX = $derived(
		layout.x - layout.width * 0.5 + (props.reel.reelIndex + REEL_PADDING) * SYMBOL_SIZE,
	);
	const colTop = $derived(layout.y - layout.height * 0.5);

	let intensity = $state(0); // 0..1 master alpha
	let pulse = $state(0);
	let sparks = $state<Array<{ id: number; fy: number; fx: number }>>([]);
	let sparkId = 0;
	let phase: 'intro' | 'loop' | 'out' = 'intro';

	// intro
	tween({ duration: 350, ease: easeOutCubic, onUpdate: (v) => (intensity = v), timeScale });

	// loop: pulse + climbing sparkles on a deterministic schedule
	let lastSpark = 0;
	const cancelLoop = loopTween({
		duration: 1200,
		timeScale,
		onUpdate: (v) => {
			pulse = 0.5 + 0.5 * Math.sin(v * Math.PI * 2);
			if (phase === 'loop' || phase === 'intro') {
				const slot = Math.floor(v * 4);
				if (slot !== lastSpark) {
					lastSpark = slot;
					sparks = [
						...sparks.slice(-6),
						{
							id: ++sparkId,
							fy: 0.9 - trigHash(sparkId, props.reel.reelIndex) * 0.75,
							fx: (trigHash(sparkId, 7) - 0.5) * 0.7,
						},
					];
				}
			}
		},
	});
	onDestroy(cancelLoop);

	$effect(() => {
		if (phase === 'intro') phase = 'loop';
		if (props.reel.reelState.motion === 'stopped' && phase !== 'out') {
			phase = 'out';
			tween({
				duration: 300,
				onUpdate: (v) => (intensity = 1 - v),
				timeScale,
			}).done.then(() => props.oncomplete());
		}
	});
</script>

{#if intensity > 0}
	<Container x={colX} y={colTop} alpha={intensity}>
		<!-- layered additive strips = soft glow column, brightest at centre -->
		{#each [1.0, 0.72, 0.45] as fw, i (i)}
			<Rectangle
				x={(-SYMBOL_SIZE * fw) / 2}
				y={0}
				width={SYMBOL_SIZE * fw}
				height={layout.height}
				backgroundColor={i === 2 ? 0xf6c445 : 0x6a4fc1}
				alpha={(0.10 + 0.05 * pulse) * (i + 1) * 0.5}
				blendMode="add"
			/>
		{/each}
		<!-- hot base line at the bottom of the column -->
		<Rectangle
			x={-SYMBOL_SIZE * 0.5}
			y={layout.height - 6}
			width={SYMBOL_SIZE}
			height={6}
			backgroundColor={0xffe9a4}
			alpha={0.5 + 0.35 * pulse}
			blendMode="add"
		/>
		{#each sparks as s (s.id)}
			<FxOnce
				key="fxSparkle"
				x={s.fx * SYMBOL_SIZE}
				y={s.fy * layout.height}
				scale={0.6}
				blendMode="add"
				oncomplete={() => (sparks = sparks.filter((q) => q.id !== s.id))}
			/>
		{/each}
	</Container>
{/if}
