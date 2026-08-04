<script lang="ts">
	import { Container, Rectangle, Circle } from 'pixi-svelte';

	/**
	 * Slow counter-rotating ray fan — stands in for the two `radial` bones the
	 * tumble_multiplier rig spun behind its badge.
	 */
	type Props = {
		/** seconds; drives rotation and the alpha envelope */
		time: number;
		radius: number;
		x?: number;
		y?: number;
		rays?: number;
		alpha?: number;
		color?: number;
		glowColor?: number;
	};
	const props: Props = $props();

	const RAYS = $derived(props.rays ?? 14);
	const gain = $derived(props.alpha ?? 1);
	const color = $derived(props.color ?? 0xe8c87a);
	const glow = $derived(props.glowColor ?? 0x4a2d7a);

	const spinA = $derived(props.time * 0.55);
	const spinB = $derived(-props.time * 0.34);

	const fan = (count: number, phase: number, len: number, wide: number) =>
		Array.from({ length: count }, (_, i) => {
			const a = phase + (i * Math.PI * 2) / count;
			return {
				key: i,
				x: (Math.cos(a) * len) / 2,
				y: (Math.sin(a) * len) / 2,
				w: len,
				h: wide,
				rotation: a,
			};
		});

	const fanA = $derived(fan(RAYS, spinA, props.radius * 1.55, props.radius * 0.075));
	const fanB = $derived(fan(Math.round(RAYS * 0.6), spinB, props.radius * 1.15, props.radius * 0.13));
</script>

<Container x={props.x ?? 0} y={props.y ?? 0}>
	<Circle
		anchor={0.5}
		diameter={props.radius * 1.5}
		backgroundColor={glow}
		backgroundAlpha={0.4 * gain}
	/>

	{#each fanB as r (r.key)}
		<Rectangle
			x={r.x}
			y={r.y}
			anchor={0.5}
			width={r.w}
			height={r.h}
			rotation={r.rotation}
			borderRadius={r.h * 0.5}
			backgroundColor={glow}
			backgroundAlpha={0.35 * gain}
		/>
	{/each}

	{#each fanA as r (r.key)}
		<Rectangle
			x={r.x}
			y={r.y}
			anchor={0.5}
			width={r.w}
			height={r.h}
			rotation={r.rotation}
			borderRadius={r.h * 0.5}
			backgroundColor={color}
			backgroundAlpha={0.28 * gain}
		/>
	{/each}

	<Circle
		anchor={0.5}
		diameter={props.radius * 0.72}
		backgroundColor={color}
		backgroundAlpha={0.22 * gain}
	/>
</Container>
