<script lang="ts" module>
	export type Props = {
		/** spriteSheet asset key from assets.ts, e.g. 'fxSparkle' */
		key: string;
		x?: number;
		y?: number;
		scale?: number;
		rotation?: number;
		/** 'add' for fx_sparkle / fx_trail (authored on black), 'normal' for fx_land */
		blendMode?: 'add' | 'normal' | 'screen';
		animationSpeed?: number; // 1 = 60fps playback; 0.4 ≈ 24fps
		oncomplete?: () => void;
	};
</script>

<script lang="ts">
	import { SpriteSheet } from 'pixi-svelte';

	const props: Props = $props();
	let finished = $state(false);
</script>

{#if !finished}
	<SpriteSheet
		key={props.key}
		x={props.x}
		y={props.y}
		anchor={0.5}
		scale={props.scale ?? 1}
		rotation={props.rotation ?? 0}
		blendMode={props.blendMode ?? 'add'}
		animationSpeed={props.animationSpeed ?? 0.4}
		loop={false}
		play
		onComplete={() => {
			finished = true;
			props.oncomplete?.();
		}}
	/>
{/if}
