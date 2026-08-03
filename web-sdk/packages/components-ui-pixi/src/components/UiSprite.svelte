<script lang="ts" module>
	import { Rectangle, Sprite, type RectangleProps } from 'pixi-svelte';
	import { sharedAssetsPixi } from 'constants-shared/assets';

	export type Props = RectangleProps & {
		/**
		 * Slot in `sharedAssetsPixi`. With art registered for the slot this renders our
		 * sprite (ADD YOUR DESIGN); without it, the SDK's drawn rectangle.
		 */
		key?: keyof typeof sharedAssetsPixi;
		tint?: number;
	};

	const hasArt = (key?: string): key is keyof typeof sharedAssetsPixi =>
		Boolean(key && key in sharedAssetsPixi);
</script>

<script lang="ts">
	const {
		key,
		tint,
		// rectangle-only props: translated or dropped below rather than passed to the sprite
		backgroundColor,
		backgroundAlpha,
		borderColor,
		borderWidth,
		borderAlpha,
		borderRadius,
		...rest
	}: Props = $props();

	// Callers grey a button out by drawing the rectangle in `backgroundColor` (0xaaaaaa).
	// The sprite equivalent is a tint, so those disabled states keep working untouched.
	const spriteTint = $derived(tint ?? backgroundColor);
</script>

{#if hasArt(key)}
	<Sprite {key} {...rest} {...spriteTint === undefined ? {} : { tint: spriteTint }} />
{:else}
	<Rectangle
		{...rest}
		borderRadius={borderRadius ?? 50}
		{backgroundColor}
		{backgroundAlpha}
		{borderColor}
		{borderWidth}
		{borderAlpha}
	/>
{/if}
