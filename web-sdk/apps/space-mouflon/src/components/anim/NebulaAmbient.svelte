<script lang="ts">
	/**
	 * WS-B — ambient nebula shimmer: loops the fx_nebula sheet with ADD blend
	 * over the still background (black in the frames vanishes). Mount next to
	 * Starfield inside the base-game FadeContainer.
	 * NOTE: wire only after fx_nebula.json+webp exist (AI-video batch) and are
	 * registered as `fxNebula` in assets.ts — SpriteSheet logs an error if the
	 * key is missing.
	 */
	import { SpriteSheet } from 'pixi-svelte';

	type Props = {
		x: number; // canvas centre
		y: number;
		width: number; // cover the canvas; frames are 640x360
		height: number;
		alpha?: number;
	};

	const props: Props = $props();
</script>

<SpriteSheet
	key="fxNebula"
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.width}
	height={props.height}
	blendMode="add"
	alpha={props.alpha ?? 0.55}
	animationSpeed={0.12}
	loop
	play
/>
