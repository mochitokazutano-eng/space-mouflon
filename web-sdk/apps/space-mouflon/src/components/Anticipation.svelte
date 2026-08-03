<script lang="ts">
	import type { Reel } from '../game/stateGame.svelte';

	type Props = {
		reel: Reel;
		oncomplete: () => void;
	};

	const props: Props = $props();

	// v1 has no anticipation art, so the sample's falling-rocks/beam Spine is not rendered.
	// The oncomplete contract is kept: it used to fire when "anticipation_out" finished, which
	// was queued once the reel stopped, so it now fires on the reel stopping instead. That still
	// clears reelState.anticipating, which is what stops the anticipation sound loop.
	$effect(() => {
		if (props.reel.reelState.motion === 'stopped') props.oncomplete();
	});
</script>
