<script lang="ts" module>
	export type EmitterEventTransition = { type: 'transition' };
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';

	import TransitionAnimation from './TransitionAnimation.svelte';
	import { getContext } from '../game/context';

	const context = getContext();

	let transitioning = $state(false);
	let oncomplete = $state(() => {});
	// Bumped per transition so a wipe that arrives while the previous one is still fading out
	// remounts the animation — without it the new run's oncomplete would never fire.
	let transitionId = $state(0);

	context.eventEmitter.subscribeOnMount({
		transition: async () => {
			transitionId += 1;
			transitioning = true;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

{#if transitioning}
	{#key transitionId}
		<TransitionAnimation
			oncover={() => oncomplete()}
			oncomplete={() => (transitioning = false)}
		/>
	{/key}
{/if}
