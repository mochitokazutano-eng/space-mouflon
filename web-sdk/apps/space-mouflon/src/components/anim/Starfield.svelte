<script lang="ts">
	/**
	 * WS-B — parallax starfield: 3 drifting layers + a deterministic shooting
	 * star every ~9s. Pure Graphics circles, zero assets, zero contract risk.
	 * Mount inside Background.svelte's base-game FadeContainer, above the still
	 * background image, below the board (zIndex handled by mount order).
	 */
	import { onDestroy } from 'svelte';
	import { Container, Circle } from 'pixi-svelte';

	import { loopTween, trigHash } from './timeline';

	type Props = {
		width: number; // canvas sizes from stateLayoutDerived.canvasSizes()
		height: number;
		/** stars per layer; default tuned for 1920x1080 */
		counts?: [number, number, number];
	};

	const props: Props = $props();
	const counts = $derived(props.counts ?? [40, 24, 12]);

	// layer speeds (px/s at 1920 ref) — far, mid, near
	const SPEEDS = [4, 9, 16];
	const SIZES = [1.1, 1.7, 2.4];
	const ALPHAS = [0.5, 0.7, 0.9];
	const GOLD_EVERY = 9; // every 9th star is warm gold, rest cool white

	let t = $state(0); // seconds, wraps hourly (precision-safe)
	const cancel = loopTween({
		duration: 3600_000,
		onUpdate: (x) => (t = x * 3600),
	});
	onDestroy(cancel);

	// deterministic star fields
	const stars = $derived(
		counts.flatMap((n, layer) =>
			Array.from({ length: n }, (_, i) => ({
				layer,
				x0: trigHash(i * 3 + layer, 1) * props.width,
				y: trigHash(i * 7 + layer, 2) * props.height,
				tw: 0.5 + trigHash(i, layer + 3) * 2, // twinkle rate
				gold: (i * counts.length + layer) % GOLD_EVERY === 0,
			})),
		),
	);

	// shooting star: a 1.1s streak every 9s, path from a hash of the cycle index
	const shoot = $derived.by(() => {
		const cycle = Math.floor(t / 9);
		const p = (t % 9) / 1.1; // 0..1 during the first 1.1s of each cycle
		if (p >= 1) return null;
		const sx = trigHash(cycle, 5) * props.width * 0.8 + props.width * 0.1;
		const sy = trigHash(cycle, 6) * props.height * 0.35 + props.height * 0.05;
		return { x: sx + p * props.width * 0.22, y: sy + p * props.height * 0.1, p };
	});
</script>

<Container>
	{#each stars as s, i (i)}
		{@const drift = (s.x0 + t * SPEEDS[s.layer] * (props.width / 1920)) % (props.width + 8)}
		{@const twinkle = 0.75 + 0.25 * Math.sin(t * s.tw * 2 + i)}
		<Circle
			x={drift - 4}
			y={s.y}
			diameter={SIZES[s.layer] * 2}
			backgroundColor={s.gold ? 0xffe9a4 : 0xe6ebff}
			alpha={ALPHAS[s.layer] * twinkle}
		/>
	{/each}
	{#if shoot}
		{#each [0, 1, 2, 3, 4] as k (k)}
			<Circle
				x={shoot.x - k * 7}
				y={shoot.y - k * 3.2}
				diameter={(2.2 - k * 0.35) * 2}
				backgroundColor={0xfff6d8}
				alpha={(1 - shoot.p) * (1 - k * 0.18)}
			/>
		{/each}
	{/if}
</Container>
