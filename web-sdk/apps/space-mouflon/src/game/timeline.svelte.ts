/**
 * Tiny rAF timeline driver.
 *
 * Replaces the timing role the Spine rigs used to play: a seconds-based clock,
 * callbacks fired at fixed beats (what Spine called "events"), and a completion
 * callback at the end (what Spine called the "complete" listener).
 *
 * Time accumulates by delta * timeScale rather than from a fixed start, so turbo
 * mode speeds the animation up exactly the way SpineTrack's timeScale did.
 *
 * Usage inside a component:
 *
 *   let t = $state(0);
 *   $effect(() => {
 *     if (!props.animate) return;
 *     return runTimeline((v) => (t = v), {
 *       duration: 1.2,
 *       marks: [{ at: 0.3, run: () => amount.set(props.amount) }],
 *       oncomplete: props.oncomplete,
 *     });
 *   });
 *
 * The returned function cancels the frame, so returning it from $effect cleans
 * up on unmount or when the effect re-runs.
 */
export type TimelineMark = {
	/** seconds into the timeline */
	at: number;
	run: () => void;
};

export type TimelineOptions = {
	duration: number;
	marks?: TimelineMark[];
	/** read fresh each frame, so changing turbo mid-animation is respected */
	timeScale?: () => number;
	oncomplete?: () => void;
};

export function runTimeline(setTime: (t: number) => void, options: TimelineOptions) {
	let raf = 0;
	let prev = performance.now();
	let t = 0;
	let finished = false;
	const marks = (options.marks ?? []).map((m) => ({ ...m, fired: false }));

	const tick = (now: number) => {
		const scale = options.timeScale?.() ?? 1;
		t += ((now - prev) / 1000) * Math.max(0, scale);
		prev = now;

		for (const m of marks) {
			if (!m.fired && t >= m.at) {
				m.fired = true;
				m.run();
			}
		}

		if (t >= options.duration) {
			finished = true;
			setTime(options.duration);
			options.oncomplete?.();
			return;
		}

		setTime(t);
		raf = requestAnimationFrame(tick);
	};

	raf = requestAnimationFrame(tick);

	return () => {
		if (!finished) cancelAnimationFrame(raf);
	};
}

/** Linear ramp between two times, clamped at both ends. */
export const ramp = (t: number, t0: number, t1: number, v0: number, v1: number) => {
	if (t <= t0) return v0;
	if (t >= t1) return v1;
	return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
};

/** Ease-out ramp — matches the overshoot-and-settle feel of the old rigs. */
export const rampOut = (t: number, t0: number, t1: number, v0: number, v1: number) => {
	if (t <= t0) return v0;
	if (t >= t1) return v1;
	const k = (t - t0) / (t1 - t0);
	return v0 + (v1 - v0) * (1 - Math.pow(1 - k, 3));
};
