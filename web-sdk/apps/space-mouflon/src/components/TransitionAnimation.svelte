<script lang="ts" module>
	// Deep-space wipe colour. The sample's rocks-and-dust Spine sweep is replaced by a plain
	// fade, so the transition reads as ours without needing wipe art.
	export const TRANSITION_COLOR = 0x0b0a2e;
	export const FADE_IN_DURATION = 380;
	export const HOLD_DURATION = 140;
	export const FADE_OUT_DURATION = 420;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicIn, cubicOut } from 'svelte/easing';

	import { CanvasSizeRectangle } from 'components-layout';
	import { waitForTimeout } from 'utils-shared/wait';

	type Props = {
		/** Fires once the screen is fully covered — the moment to swap what sits underneath. */
		oncover?: () => void;
		/** Fires when the wipe has faded back out. Callers await this, so it must always run. */
		oncomplete: () => void;
	};

	const props: Props = $props();
	const alpha = new Tween(0);

	onMount(async () => {
		await alpha.set(1, { duration: FADE_IN_DURATION, easing: cubicIn });
		props.oncover?.();
		await waitForTimeout(HOLD_DURATION);
		await alpha.set(0, { duration: FADE_OUT_DURATION, easing: cubicOut });
		props.oncomplete();
	});
</script>

<CanvasSizeRectangle backgroundColor={TRANSITION_COLOR} backgroundAlpha={alpha.current} />
