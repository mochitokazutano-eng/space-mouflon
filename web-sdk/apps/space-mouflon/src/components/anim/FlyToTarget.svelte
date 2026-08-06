<script lang="ts">
	/**
	 * WS-C — the signature beat: fly a child (meteor sprite, win value…) from
	 * its board position to a target (the total plate / win ticker) along a
	 * curved path, spawning fx_trail puffs, then oncomplete. Generic and
	 * contract-safe: parent decides what flies and what happens on arrival
	 * (add to sum, tick the counter). Time it to sfx_multiplier_combine.
	 */
	import type { Snippet } from 'svelte';
	import { Container } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';

	import FxOnce from './FxOnce.svelte';
	import { tween, trigHash } from './timeline';

	type Props = {
		from: { x: number; y: number };
		to: { x: number; y: number };
		duration?: number; // ms at timeScale 1, default 650
		/** curve bulge in px, sign flips deterministically; 0 = straight */
		arc?: number;
		oncomplete: () => void;
		children: Snippet;
	};

	const props: Props = $props();
	const timeScale = () => stateBetDerived.timeScale();

	let x = $state(props.from.x);
	let y = $state(props.from.y);
	let scale = $state(1);
	let trail = $state<Array<{ id: number; x: number; y: number }>>([]);
	let trailId = 0;
	let lastPuff = -1;
	let done = $state(false);

	const arc = props.arc ?? 90;
	const side = trigHash(props.from.x, props.from.y) > 0.5 ? 1 : -1;

	// quadratic bezier: from -> control -> to
	const cx = (props.from.x + props.to.x) / 2 + side * arc;
	const cy = (props.from.y + props.to.y) / 2 - Math.abs(arc) * 0.6;

	tween({
		duration: props.duration ?? 650,
		ease: (t) => t * t * (3 - 2 * t), // smoothstep: gentle out, decisive in
		timeScale,
		onUpdate: (t) => {
			const u = 1 - t;
			x = u * u * props.from.x + 2 * u * t * cx + t * t * props.to.x;
			y = u * u * props.from.y + 2 * u * t * cy + t * t * props.to.y;
			scale = 1 - 0.35 * t; // shrink toward the plate
			const slot = Math.floor(t * 8);
			if (slot !== lastPuff && t < 0.9) {
				lastPuff = slot;
				trail = [...trail.slice(-5), { id: ++trailId, x, y }];
			}
		},
	}).done.then(() => {
		done = true;
		// arrival sparkle at the target, then hand control back
		props.oncomplete();
	});
</script>

{#if !done}
	<Container {x} {y} {scale}>
		{@render props.children()}
	</Container>
{/if}
{#each trail as p (p.id)}
	<FxOnce
		key="fxTrail"
		x={p.x}
		y={p.y}
		scale={1.1}
		blendMode="add"
		animationSpeed={0.5}
		oncomplete={() => (trail = trail.filter((q) => q.id !== p.id))}
	/>
{/each}
{#if done}
	<FxOnce key="fxSparkle" x={props.to.x} y={props.to.y} scale={1.4} blendMode="add" />
{/if}
