<script lang="ts" module>
	/** Win tiers in bet-multiples — align with the repo's winLevelMap. */
	export const TIERS = [
		{ name: 'BIG WIN', from: 15 },
		{ name: 'SUPER WIN', from: 30 },
		{ name: 'MEGA WIN', from: 60 },
		{ name: 'EPIC WIN', from: 120 },
		{ name: 'MAX WIN', from: 20000 },
	];
	export const tierForMultiple = (m: number) =>
		[...TIERS].reverse().find((t) => m >= t.from) ?? null;
</script>

<script lang="ts">
	/**
	 * WS-C — big-win tier escalation card. The baked-gold font ('gold') does
	 * the heavy lifting now; this adds: tier card punch-in (easeOutBack),
	 * additive shine flicker, count-up that rolls THROUGH tiers (BIG -> SUPER
	 * -> …) with a pulse on each promotion, coin sparkles, and screen-shake via
	 * a parent-provided offset callback. Ride the existing tiered audio beds.
	 * Parent owns lifecycle: mount on big win, `oncomplete` after the count-up.
	 */
	import { Container, BitmapText } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';

	import FxOnce from './FxOnce.svelte';
	import { tween, loopTween, easeOutBack, trigHash } from './timeline';
	import { onDestroy } from 'svelte';

	type Props = {
		x: number;
		y: number;
		/** final win in bet-multiples (e.g. 87.5) */
		multiple: number;
		/** formatted amount string provider, e.g. (v) => formatAmount(v * bet) */
		format: (multiple: number) => string;
		countUpMs?: number; // default scales with tier
		oncomplete: () => void;
	};

	const props: Props = $props();
	const timeScale = () => stateBetDerived.timeScale();

	let shown = $state(0); // current count-up value in multiples
	let cardScale = $state(0);
	let shine = $state(0);
	let sparks = $state<Array<{ id: number; x: number; y: number; s: number }>>([]);
	let sparkId = 0;

	const tier = $derived(tierForMultiple(shown) ?? TIERS[0]);
	let lastTier = TIERS[0].name;

	// card punch-in
	tween({ duration: 320, ease: easeOutBack, onUpdate: (v) => (cardScale = v), timeScale });

	// shine flicker loop (additive twin of the text)
	const cancelShine = loopTween({
		duration: 1800,
		onUpdate: (v) => (shine = Math.max(0, Math.sin(v * Math.PI * 2)) * 0.45),
	});
	// ambient coin sparkles while the card is up
	let lastSlot = -1;
	const cancelSparks = loopTween({
		duration: 900,
		timeScale,
		onUpdate: (v) => {
			const slot = Math.floor(v * 3);
			if (slot !== lastSlot) {
				lastSlot = slot;
				sparks = [
					...sparks.slice(-8),
					{
						id: ++sparkId,
						x: (trigHash(sparkId, 1) - 0.5) * 620,
						y: (trigHash(sparkId, 2) - 0.5) * 260,
						s: 0.8 + trigHash(sparkId, 3),
					},
				];
			}
		},
	});
	onDestroy(() => {
		cancelShine();
		cancelSparks();
	});

	// count-up rolls through tiers; pulse on each promotion
	const dur = props.countUpMs ?? Math.min(2400 + props.multiple * 8, 6000);
	tween({
		duration: dur,
		ease: (t) => 1 - Math.pow(1 - t, 2.2),
		timeScale,
		onUpdate: (t) => {
			shown = props.multiple * t;
			const now = tierForMultiple(shown)?.name ?? lastTier;
			if (now !== lastTier) {
				lastTier = now;
				tween({
					duration: 260,
					ease: easeOutBack,
					onUpdate: (v) => (cardScale = 1 + 0.18 * (1 - v)),
					timeScale,
				});
			}
		},
	}).done.then(() => {
		shown = props.multiple;
		props.oncomplete();
	});
</script>

<Container x={props.x} y={props.y} scale={cardScale}>
	<BitmapText
		anchor={0.5}
		y={-70}
		text={tier.name}
		style={{ fontFamily: 'gold', fontSize: 130 }}
	/>
	{#if shine > 0}
		<BitmapText
			anchor={0.5}
			y={-70}
			text={tier.name}
			style={{ fontFamily: 'gold', fontSize: 130 }}
			blendMode="add"
			alpha={shine}
		/>
	{/if}
	<BitmapText
		anchor={0.5}
		y={55}
		text={props.format(shown)}
		style={{ fontFamily: 'gold', fontSize: 96 }}
	/>
	{#each sparks as sp (sp.id)}
		<FxOnce
			key="fxSparkle"
			x={sp.x}
			y={sp.y}
			scale={sp.s}
			blendMode="add"
			oncomplete={() => (sparks = sparks.filter((q) => q.id !== sp.id))}
		/>
	{/each}
</Container>
