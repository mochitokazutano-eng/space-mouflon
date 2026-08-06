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
	import { Sprite } from 'pixi-svelte';

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

</script>

{#if intensity > 0}
	{@const a = intensity * (0.45 + 0.08 * level) * (0.7 + 0.3 * pulse)}
	<!-- additive gold twins of the real frame sprite: the glow follows every
	     curve and horn crest instead of drawing hard rectangles -->
	{#each [{ s: 1.0, f: 0.6 }, { s: 1.03, f: 0.32 }] as glowLayer (glowLayer.s)}
		<Sprite
			key="frameReels"
			anchor={0.5}
			x={layout.x}
			y={layout.y}
			width={layout.width * (1960 / 1920) * glowLayer.s}
			height={layout.height * (1680 / 1640) * glowLayer.s}
			tint={0xf6c445}
			blendMode="add"
			alpha={a * glowLayer.f}
		/>
	{/each}
{/if}
