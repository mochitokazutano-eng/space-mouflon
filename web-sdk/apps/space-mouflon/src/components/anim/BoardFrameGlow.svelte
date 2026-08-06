<script lang="ts">
	/**
	 * WS-B — reel-frame energy glow, code-driven. Listens to the SAME emitter
	 * events the sample spine rig used (boardFrameGlowShow / boardFrameGlowHide)
	 * so existing game logic drives it unchanged. Optional escalation: broadcast
	 * {type:'boardFrameGlowLevel', level:1..5} from the tumble handler and the
	 * glow brightens per cascade step.
	 * Mount behind the frame_reels sprite (zIndex just below it).
	 */
	import { onDestroy } from 'svelte';
	import { Container, Rectangle } from 'pixi-svelte';

	import { tween, loopTween, easeOutCubic } from './timeline';
	import { getContext } from '../../game/context';

	const context = getContext();
	const layout = $derived(context.stateGameDerived.boardLayout());

	let intensity = $state(0);
	let level = $state(1); // cascade escalation 1..5
	let pulse = $state(0);

	const cancelPulse = loopTween({
		duration: 1600,
		onUpdate: (v) => (pulse = 0.5 + 0.5 * Math.sin(v * Math.PI * 2)),
	});
	onDestroy(cancelPulse);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			tween({ duration: 250, ease: easeOutCubic, onUpdate: (v) => (intensity = v) });
		},
		boardFrameGlowHide: () => {
			tween({ duration: 400, onUpdate: (v) => (intensity = 1 - v) }).done.then(
				() => (level = 1),
			);
		},
		// optional — emit from the tumble/cascade handler for escalation
		boardFrameGlowLevel: (event: { level: number }) => {
			level = Math.min(Math.max(event.level, 1), 5);
		},
	} as Parameters<typeof context.eventEmitter.subscribeOnMount>[0]);

	const PAD = 14; // glow reaches this far outside the board edge
</script>

{#if intensity > 0}
	{@const a = intensity * (0.55 + 0.1 * level) * (0.75 + 0.25 * pulse)}
	<Container
		x={layout.x - layout.width * 0.5}
		y={layout.y - layout.height * 0.5}
		alpha={a}
	>
		<!-- three additive inset strokes = soft gold rim around the board -->
		{#each [0, 6, 12] as inset, i (i)}
			{@const col = i === 0 ? 0xffe9a4 : i === 1 ? 0xf6c445 : 0x6a4fc1}
			{@const alpha_i = 0.35 - i * 0.09 + level * 0.04}
			<!-- top / bottom / left / right bars -->
			<Rectangle x={-PAD + inset} y={-PAD + inset} width={layout.width + 2 * (PAD - inset)} height={8} backgroundColor={col} alpha={alpha_i} blendMode="add" />
			<Rectangle x={-PAD + inset} y={layout.height + PAD - inset - 8} width={layout.width + 2 * (PAD - inset)} height={8} backgroundColor={col} alpha={alpha_i} blendMode="add" />
			<Rectangle x={-PAD + inset} y={-PAD + inset} width={8} height={layout.height + 2 * (PAD - inset)} backgroundColor={col} alpha={alpha_i} blendMode="add" />
			<Rectangle x={layout.width + PAD - inset - 8} y={-PAD + inset} width={8} height={layout.height + 2 * (PAD - inset)} backgroundColor={col} alpha={alpha_i} blendMode="add" />
		{/each}
	</Container>
{/if}
