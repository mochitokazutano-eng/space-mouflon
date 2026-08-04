<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Container, Circle } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { rampOut } from '../game/timeline.svelte';
	import Burst from './Burst.svelte';
	import RadialRays from './RadialRays.svelte';

	/**
	 * Replaces the `bigwin` Spine rig.
	 *
	 * The rig had 15 animations across five win tiers, but this component only
	 * ever drove two of them: `intro`, then a looping `idle`. It never set
	 * `outro`, never assigned an `oncomplete`, and ignored the rig's
	 * coins_start / start_countup / coins_end events entirely — the coin loop is
	 * driven from bookEventHandlerMap, not from here. So the live contract is
	 * just: play an intro, settle into a loop, and host `children` where the
	 * `slot_win_count` slot used to be.
	 *
	 * Intro durations are taken from the rig (big 1.33s ... max 1.67s) so the
	 * hand-off to the win count-up keeps the same rhythm.
	 */
	type Props = {
		animationMap: {
			intro:
				| 'big_win_intro'
				| 'epic_win_intro'
				| 'max_win_intro'
				| 'mega_win_intro'
				| 'super_win_intro';
			idle: 'big_win_idle' | 'epic_win_idle' | 'max_win_idle' | 'mega_win_idle' | 'super_win_idle';
			outro: 'big_win_exit' | 'epic_win_exit' | 'max_win_exit' | 'mega_win_exit' | 'super_win_exit';
		};
		children: Snippet;
	};
	const props: Props = $props();
	const context = getContext();

	type Tier = 'big' | 'super' | 'mega' | 'epic' | 'max';

	/** Each tier reads visibly bigger than the one below it. */
	const TIERS: Record<Tier, {
		intro: number;
		rays: number;
		rayScale: number;
		burst: number;
		shards: number;
		sparks: number;
		pulse: number;
		gold: number;
	}> = {
		big:   { intro: 1.33, rays: 10, rayScale: 0.62, burst: 0.42, shards: 14, sparks: 10, pulse: 0.018, gold: 0xe8c87a },
		super: { intro: 1.4,  rays: 12, rayScale: 0.72, burst: 0.5,  shards: 18, sparks: 16, pulse: 0.022, gold: 0xeed08a },
		mega:  { intro: 1.5,  rays: 14, rayScale: 0.84, burst: 0.58, shards: 22, sparks: 22, pulse: 0.026, gold: 0xf2d795 },
		epic:  { intro: 1.6,  rays: 18, rayScale: 0.96, burst: 0.68, shards: 26, sparks: 30, pulse: 0.03,  gold: 0xf7e2ab },
		max:   { intro: 1.67, rays: 22, rayScale: 1.1,  burst: 0.8,  shards: 32, sparks: 40, pulse: 0.035, gold: 0xfaeeca },
	};

	const tier = $derived((props.animationMap.intro.split('_')[0] as Tier) ?? 'big');
	const cfg = $derived(TIERS[tier] ?? TIERS.big);

	const boardWidth = $derived(context.stateGameDerived.boardLayout().width);

	let t = $state(0);

	// One clock for the whole life of the component: the intro is simply the
	// first `cfg.intro` seconds of it, and the idle loop is everything after.
	$effect(() => {
		let raf = 0;
		let prev = performance.now();
		const tick = (now: number) => {
			t += (now - prev) / 1000;
			prev = now;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const introDone = $derived(t >= cfg.intro);

	// intro: snap up past full size, then settle. idle: slow breathing pulse.
	const contentScale = $derived(
		!introDone
			? t < cfg.intro * 0.45
				? rampOut(t, 0, cfg.intro * 0.45, 0.25, 1.14)
				: rampOut(t, cfg.intro * 0.45, cfg.intro, 1.14, 1)
			: 1 + cfg.pulse * Math.sin((t - cfg.intro) * 2.6),
	);
	const contentAlpha = $derived(Math.min(1, t / (cfg.intro * 0.28)));

	const burstProgress = $derived(t / (cfg.intro * 0.85));
	const raysAlpha = $derived(Math.min(1, t / (cfg.intro * 0.5)) * (introDone ? 1 : 0.85));

	/** Deterministic sparkle field — same trig hash as Burst, no RNG. */
	const hash = (i: number, salt: number) => {
		const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
		return v - Math.floor(v);
	};

	const sparks = $derived(
		Array.from({ length: cfg.sparks }, (_, i) => {
			const ang = hash(i, 1) * Math.PI * 2;
			const rad = boardWidth * (0.18 + 0.42 * hash(i, 2));
			const speed = 0.7 + 1.6 * hash(i, 3);
			const phase = hash(i, 4) * Math.PI * 2;
			const tw = 0.5 + 0.5 * Math.sin(t * speed * 2.2 + phase);
			// slow drift outward and back so the field never looks static
			const drift = 1 + 0.06 * Math.sin(t * speed * 0.8 + phase);
			return {
				key: i,
				x: Math.cos(ang) * rad * drift,
				y: Math.sin(ang) * rad * drift * 0.62,
				d: boardWidth * (0.006 + 0.012 * hash(i, 5)) * (0.6 + 0.8 * tw),
				alpha: (0.25 + 0.75 * tw) * raysAlpha,
			};
		}),
	);
</script>

<Container>
	<RadialRays
		time={t}
		radius={boardWidth * cfg.rayScale}
		rays={cfg.rays}
		alpha={raysAlpha * 0.9}
		color={cfg.gold}
	/>

	{#each sparks as s (s.key)}
		<Circle
			x={s.x}
			y={s.y}
			anchor={0.5}
			diameter={s.d}
			backgroundColor={cfg.gold}
			backgroundAlpha={s.alpha}
		/>
	{/each}

	<Burst
		progress={burstProgress}
		radius={boardWidth * cfg.burst}
		shards={cfg.shards}
		embers={Math.round(cfg.shards * 1.4)}
	/>

	<Container scale={contentScale} alpha={contentAlpha}>
		{@render props.children()}
	</Container>
</Container>
