<script lang="ts">
	import { Container, Rectangle } from 'pixi-svelte';

	type Props = {
		x?: number;
		y?: number;
		size: number;
	};

	const props: Props = $props();

	// Drives the pulse. Replaces the looping 'payframe' spine animation.
	let elapsed = $state(0);
	$effect(() => {
		let raf = 0;
		const start = performance.now();
		const tick = (now: number) => {
			elapsed = (now - start) / 1000;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const pulse = $derived(0.5 + 0.5 * Math.sin(elapsed * 3.4));
	const s = $derived(props.size);
</script>

<Container x={props.x} y={props.y} alpha={0.72 + 0.28 * pulse} scale={1 + 0.025 * pulse}>
	<!-- outer bloom -->
	<Rectangle
		anchor={0.5}
		width={s * 1.10}
		height={s * 1.10}
		borderRadius={s * 0.20}
		backgroundAlpha={0}
		borderColor={0x4a2d7a}
		borderWidth={s * 0.090}
		borderAlpha={0.30 + 0.35 * pulse}
	/>
	<!-- gold frame -->
	<Rectangle
		anchor={0.5}
		width={s * 0.98}
		height={s * 0.98}
		borderRadius={s * 0.17}
		backgroundAlpha={0}
		borderColor={0xe8c87a}
		borderWidth={s * 0.045}
		borderAlpha={1}
	/>
	<!-- inner highlight -->
	<Rectangle
		anchor={0.5}
		width={s * 0.88}
		height={s * 0.88}
		borderRadius={s * 0.14}
		backgroundAlpha={0}
		borderColor={0xf5ecd8}
		borderWidth={s * 0.016}
		borderAlpha={0.45 + 0.55 * pulse}
	/>
</Container>
