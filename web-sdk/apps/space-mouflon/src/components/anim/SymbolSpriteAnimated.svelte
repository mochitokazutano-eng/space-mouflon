<script lang="ts" module>
	/**
	 * Drop-in upgrade of SymbolSprite — gives static-sprite symbols real life:
	 *   land  → squash-stretch settle + dust puff (fx_land)
	 *   win   → pop + additive flash + colour sparkles (fx_sparkle) → oncomplete
	 *   static/postWinStatic → hero idle breathing · scatter vortex rotation
	 *   spin  → plain sprite
	 * Contracts preserved: `oncomplete` ALWAYS fires for land/win (safety-capped),
	 * so ReelSymbol's state machine and the tumble flow never hang.
	 * Turbo: all timings scale by stateBet.isTurbo (2x).
	 */
	export const HERO_NAMES = ['H1', 'H2', 'H3', 'H4'];
	export const SCATTER_NAME = 'S';

	/** per-symbol sparkle accents (win burst) — bible glow language */
	export const SPARKLE_TINTS: Record<string, number> = {
		H1: 0xf6c445, H2: 0xffe9a4, H3: 0x9b7bf0, H4: 0x35e0d4,
		L1: 0xf59e0b, L2: 0xe11d48, L3: 0x14b8a6, L4: 0x3b82f6, L5: 0x8b5cf6,
		M: 0xf6c445, S: 0x6a4fc1,
	};
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { Container, Sprite } from 'pixi-svelte';
	import { stateBet } from 'state-shared';

	import FxOnce from './FxOnce.svelte';
	import { tween, sequence, loopTween, trigHash, easeOutBack, easeInOutSine } from './timeline';
	import { SYMBOL_SIZE } from '../../game/constants';
	import type { getSymbolInfo } from '../../game/utils';
	import type { SymbolState } from '../../game/types';

	type Props = {
		x?: number;
		y?: number;
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		state: SymbolState;
		name: string; // rawSymbol.name — drives idle/vortex/sparkle tint
		oncomplete?: () => void;
	};

	const props: Props = $props();
	const timeScale = () => (stateBet.isTurbo ? 2 : 1);

	// animated transform state
	let sx = $state(1);
	let sy = $state(1);
	let rot = $state(0);
	let flash = $state(0); // additive self-overlay alpha
	let puffs = $state<Array<{ id: number; key: string; scale: number; rot: number; tint?: number }>>([]);
	let puffId = 0;

	const w = $derived(SYMBOL_SIZE * props.symbolInfo.sizeRatios.width);
	const h = $derived(SYMBOL_SIZE * props.symbolInfo.sizeRatios.height);
	const phase = $derived(trigHash(props.x ?? 0, props.y ?? 0));

	let cancelIdle: (() => void) | null = null;
	let completed = false;

	function finish() {
		if (completed) return;
		completed = true;
		props.oncomplete?.();
	}

	function stopIdle() {
		cancelIdle?.();
		cancelIdle = null;
	}

	function startIdle() {
		stopIdle();
		if (props.name === SCATTER_NAME) {
			// vortex: continuous rotation + soft pulse (art is radially symmetric)
			cancelIdle = loopTween({
				duration: 6000,
				timeScale,
				onUpdate: (t) => {
					rot = t * Math.PI * 2;
					flash = 0.08 + 0.06 * Math.sin(t * Math.PI * 4);
				},
			});
		} else if (HERO_NAMES.includes(props.name)) {
			// hero breathing, phase-offset per cell so the board doesn't pump in sync
			cancelIdle = loopTween({
				duration: 2400,
				timeScale: () => 1, // idle ignores turbo
				onUpdate: (t) => {
					const b = Math.sin((t + phase) * Math.PI * 2);
					sx = 1 + 0.012 * b;
					sy = 1 - 0.012 * b;
				},
			});
		}
	}

	function playLand() {
		completed = false;
		puffs = [...puffs.slice(-8), { id: ++puffId, key: 'fxLand', scale: (w / 128) * 1.35, rot: 0 }];
		sequence(
			[
				{ duration: 90, onUpdate: (t) => ((sy = 1 - 0.16 * t), (sx = 1 + 0.1 * t)) },
				{ duration: 130, ease: easeOutBack, onUpdate: (t) => ((sy = 0.84 + 0.22 * t), (sx = 1.1 - 0.13 * t)) },
				{ duration: 90, onUpdate: (t) => ((sy = 1.06 - 0.06 * t), (sx = 0.97 + 0.03 * t)) },
			],
			timeScale,
		).then(() => ((sx = 1), (sy = 1), finish()));
	}

	function playWin() {
		completed = false;
		const tint = SPARKLE_TINTS[props.name] ?? 0xf6c445;
		// three deterministic sparkles around the symbol
		for (let i = 0; i < 3; i++) {
			const a = (phase + i / 3) * Math.PI * 2;
			puffs = [
				...puffs.slice(-8),
				{
					id: ++puffId,
					key: 'fxSparkle',
					scale: 0.9 + 0.5 * trigHash(i, phase * 10),
					rot: a,
					tint,
				},
			];
		}
		tween({
			duration: 150,
			onUpdate: (t) => (flash = 0.85 * t),
			timeScale,
		});
		sequence(
			[
				{ duration: 170, ease: easeOutBack, onUpdate: (t) => ((sx = 1 + 0.2 * t), (sy = 1 + 0.2 * t)) },
				{ duration: 240, ease: easeInOutSine, onUpdate: (t) => {
					const s = 1.2 - 0.12 * t;
					sx = s; sy = s; flash = 0.85 * (1 - t);
				} },
			],
			timeScale,
		).then(() => ((sx = 1.08), (sy = 1.08), (flash = 0), finish()));
	}

	function handleState(s: SymbolState) {
		stopIdle();
		rot = 0; flash = 0;
		if (s === 'land') playLand();
		else if (s === 'win') playWin();
		else {
			sx = 1; sy = 1;
			if (s === 'static' || s === 'postWinStatic') startIdle();
			// 'spin' renders plain; states with no animation must still honour
			// the completion contract:
			if (s !== 'static' && s !== 'postWinStatic' && s !== 'spin') finish();
		}
	}

	$effect(() => {
		// Depend ONLY on the state (and identity) — everything the handlers
		// touch (puffs array, transforms) is untracked, otherwise each finished
		// particle re-triggers this effect and the animation replays forever.
		const s = props.state;
		props.name;
		untrack(() => handleState(s));
	});

	onDestroy(stopIdle);
</script>

<Container x={props.x} y={props.y} rotation={rot} scale={{ x: sx, y: sy }}>
	<Sprite anchor={0.5} key={props.symbolInfo.assetKey} width={w} height={h} />
	{#if flash > 0}
		<!-- additive self-overlay = rim/energy flash without extra art -->
		<Sprite anchor={0.5} key={props.symbolInfo.assetKey} width={w} height={h} blendMode="add" alpha={flash} />
	{/if}
</Container>

{#each puffs as p (p.id)}
	<FxOnce
		key={p.key}
		x={props.x}
		y={p.key === 'fxLand' ? (props.y ?? 0) + h * 0.28 : props.y}
		scale={p.scale}
		rotation={p.rot}
		blendMode={p.key === 'fxLand' ? 'normal' : 'add'}
		oncomplete={() => (puffs = puffs.filter((q) => q.id !== p.id))}
	/>
{/each}
