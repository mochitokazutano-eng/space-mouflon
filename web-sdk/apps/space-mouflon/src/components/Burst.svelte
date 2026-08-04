<script lang="ts" module>
	export type BurstPalette = {
		halo: number;
		ring: number;
		ringInner: number;
		shard: number;
		shardAlt: number;
		ember: number;
	};

	/** Space Mouflon's horn gold over a deep-purple shockwave. */
	export const GOLD_BURST: BurstPalette = {
		halo: 0x4a2d7a,
		ring: 0xc4bcd6,
		ringInner: 0xe8c87a,
		shard: 0xfaeeca,
		shardAlt: 0xd4a94e,
		ember: 0xf5ecd8,
	};
</script>

<script lang="ts">
	import { Container, Circle, Rectangle } from 'pixi-svelte';

	type Props = {
		/** 0 = not started, 1 = fully dissipated. Outside (0,1) nothing renders. */
		progress: number;
		/** radius the shockwave reaches at progress = 1 */
		radius: number;
		x?: number;
		y?: number;
		shards?: number;
		embers?: number;
		/** multiplied into every element's alpha */
		alpha?: number;
		palette?: BurstPalette;
	};
	const props: Props = $props();

	const SHARDS = $derived(props.shards ?? 16);
	const EMBERS = $derived(props.embers ?? 22);
	const pal = $derived(props.palette ?? GOLD_BURST);
	const gain = $derived(props.alpha ?? 1);

	const p = $derived(Math.min(1, Math.max(0, props.progress)));
	const live = $derived(props.progress > 0 && props.progress < 1);

	/** Fade floor: elements never snap to zero mid-flight. */
	const q = $derived(1 - p * 0.94);
	const easeOut = (v: number, k = 3.2) => 1 - Math.exp(-k * v);

	/**
	 * Deterministic scatter. A trig hash rather than Math.random(), so the burst
	 * is identical on every win and across reloads — no frame-to-frame jitter.
	 */
	const jitter = (i: number, salt: number) => {
		const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
		return v - Math.floor(v);
	};

	const haloD = $derived(2 * (props.radius * (0.18 + 0.62 * easeOut(p, 2.6))));
	const ringD = $derived(2 * (props.radius * easeOut(p, 3.4)));
	const ringW = $derived(Math.max(1, props.radius * 0.17 * (1 - p) + 2));

	const shardList = $derived(
		Array.from({ length: SHARDS }, (_, j) => {
			const ang = ((j * 360) / SHARDS + 26 * (jitter(j, 1) - 0.5)) * (Math.PI / 180);
			const speed = 0.42 + 1.05 * jitter(j, 2);
			const dist = props.radius * (0.12 + 0.76 * easeOut(p * speed, 3.1));
			const len = props.radius * 0.2 * (1 - 0.6 * p) * (0.55 + 0.85 * jitter(j, 3));
			return {
				key: j,
				x: Math.cos(ang) * dist,
				y: Math.sin(ang) * dist,
				w: Math.max(1, len),
				h: Math.max(1, len * (0.3 + 0.22 * jitter(j, 8))),
				// shards tumble as they fly rather than staying radial
				rotation: ang + 2.6 * jitter(j, 9) * p,
				color: j % 3 === 0 ? pal.shard : pal.shardAlt,
			};
		}),
	);

	const emberList = $derived(
		Array.from({ length: EMBERS }, (_, j) => {
			const ang = ((j * 360) / EMBERS + 40 * (jitter(j, 4) - 0.5)) * (Math.PI / 180);
			const speed = 0.35 + 1.25 * jitter(j, 5);
			const dist = props.radius * (0.08 + 0.9 * easeOut(p * speed, 2.6));
			return {
				key: j,
				x: Math.cos(ang) * dist,
				y: Math.sin(ang) * dist,
				d: Math.max(1, props.radius * 0.035 * (1 - 0.45 * p) * (0.4 + 1.1 * jitter(j, 6))),
				color: j % 2 ? pal.ember : pal.ring,
			};
		}),
	);
</script>

{#if live}
	<Container x={props.x ?? 0} y={props.y ?? 0}>
		<!-- soft purple pressure wave -->
		<Circle
			anchor={0.5}
			diameter={haloD}
			backgroundAlpha={0}
			borderColor={pal.halo}
			borderWidth={Math.max(2, props.radius * 0.22 * (1 - p) + 4)}
			borderAlpha={0.55 * q * gain}
		/>

		<!-- shockwave: lavender outer edge, gold leading edge just inside it -->
		<Circle
			anchor={0.5}
			diameter={ringD}
			backgroundAlpha={0}
			borderColor={pal.ring}
			borderWidth={ringW}
			borderAlpha={0.45 * q * gain}
		/>
		<Circle
			anchor={0.5}
			diameter={Math.max(0, ringD - ringW * 0.9)}
			backgroundAlpha={0}
			borderColor={pal.ringInner}
			borderWidth={Math.max(1, ringW * 0.55)}
			borderAlpha={0.9 * q * gain}
		/>

		{#each emberList as e (e.key)}
			<Circle
				x={e.x}
				y={e.y}
				anchor={0.5}
				diameter={e.d}
				backgroundColor={e.color}
				backgroundAlpha={Math.pow(q, 1.8) * gain}
			/>
		{/each}

		{#each shardList as s (s.key)}
			<Rectangle
				x={s.x}
				y={s.y}
				anchor={0.5}
				width={s.w}
				height={s.h}
				rotation={s.rotation}
				borderRadius={Math.min(s.w, s.h) * 0.4}
				backgroundColor={s.color}
				backgroundAlpha={Math.pow(q, 1.4) * gain}
			/>
		{/each}
	</Container>
{/if}
