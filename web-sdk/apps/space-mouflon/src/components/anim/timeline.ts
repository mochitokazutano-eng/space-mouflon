/**
 * Space Mouflon — tiny rAF tween/timeline util (T1).
 * Deterministic, turbo-aware (timeScale getter), always resolves (safety cap)
 * so `oncomplete` game-flow contracts can never hang the tumble.
 *
 * NOTE: if the repo already has `timeline.svelte.ts` (big-win rebuild), prefer
 * it for new work — this file exists so the symbol-life components are
 * self-contained. No Math.random anywhere: phase offsets come from trig hashes.
 */

export type Ease = (t: number) => number;

export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack: Ease = (t) => {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export type TweenOpts = {
	duration: number; // ms at timeScale 1
	ease?: Ease;
	onUpdate: (t: number) => void; // eased 0..1
	timeScale?: () => number; // e.g. () => (stateBet.isTurbo ? 2 : 1)
};

type Handle = { cancel: () => void; done: Promise<void> };

/** Hard cap so a lost rAF can never freeze game flow (oncomplete contract). */
const SAFETY_MS = 4000;

export function tween(opts: TweenOpts): Handle {
	let raf = 0;
	let cancelled = false;
	const ease = opts.ease ?? easeOutCubic;
	const done = new Promise<void>((resolve) => {
		const start = performance.now();
		const step = (now: number) => {
			if (cancelled) return resolve();
			const scale = opts.timeScale?.() ?? 1;
			const t = Math.min(((now - start) * scale) / opts.duration, 1);
			opts.onUpdate(ease(t));
			if (t >= 1 || now - start > SAFETY_MS) return resolve();
			raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	});
	return { cancel: () => ((cancelled = true), cancelAnimationFrame(raf)), done };
}

/** Multi-beat sequence: [{to keyframe fractions… handled by caller}] */
export async function sequence(
	beats: Array<Omit<TweenOpts, 'timeScale'>>,
	timeScale?: () => number,
): Promise<void> {
	for (const b of beats) await tween({ ...b, timeScale }).done;
}

/** Endless loop (idle breathing, vortex spin). Returns cancel. */
export function loopTween(
	opts: Omit<TweenOpts, 'ease'> & { ease?: Ease },
): () => void {
	let cancelled = false;
	let raf = 0;
	const start = performance.now();
	const step = (now: number) => {
		if (cancelled) return;
		const scale = opts.timeScale?.() ?? 1;
		const t = (((now - start) * scale) % opts.duration) / opts.duration;
		opts.onUpdate((opts.ease ?? ((x) => x))(t));
		raf = requestAnimationFrame(step);
	};
	raf = requestAnimationFrame(step);
	return () => ((cancelled = true), cancelAnimationFrame(raf));
}

/** Deterministic 0..1 hash from board coordinates (no Math.random). */
export const trigHash = (x: number, y: number) =>
	Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
