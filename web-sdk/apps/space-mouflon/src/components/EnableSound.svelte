<script lang="ts">
	import { onMount } from 'svelte';

	import { sound } from '../game/sound.svelte';

	onMount(() => {
		// Our cues are individual files served from static/, so there is no pixi audio asset to
		// hand over — the manifest drives the Howl set.
		const { destroy } = sound.load();

		return () => {
			// Equivalent to onDestroy(); Leave this comment for searching.
			destroy();
		};
	});

	sound.enableEffect();
	sound.volumeEffect();
</script>
