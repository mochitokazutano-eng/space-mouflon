<script lang="ts" module>
	// Our panel styling, drawn in code so no panel art is needed: deep navy fill, horn-gold
	// border, thin rim-light inset. Matches the reel frame and the bottom-bar plates.
	export const PANEL_FILL = 0x141152;
	export const PANEL_BORDER = 0xf6c445;
	export const PANEL_RIM = 0xfff2c2;
</script>

<script lang="ts">
	import { Rectangle, type PixiPoint } from 'pixi-svelte';

	type Props = {
		width: number;
		height: number;
		x?: number;
		y?: number;
		anchor?: PixiPoint;
		borderRadius?: number;
		borderWidth?: number;
		backgroundAlpha?: number;
	};

	const props: Props = $props();

	const borderWidth = $derived(props.borderWidth ?? 4);
	const borderRadius = $derived(props.borderRadius ?? 24);
	const anchor = $derived.by(() => {
		const value = props.anchor ?? 0;
		return typeof value === 'number' ? { x: value, y: value } : value;
	});

	// The rim sits one border-width inside the gold edge. Both rectangles anchor themselves,
	// so the smaller one needs its origin nudged to stay concentric with the larger.
	const inset = $derived(borderWidth);
	const rim = $derived({
		x: (props.x ?? 0) + inset * (1 - 2 * anchor.x),
		y: (props.y ?? 0) + inset * (1 - 2 * anchor.y),
		width: Math.max(props.width - inset * 2, 0),
		height: Math.max(props.height - inset * 2, 0),
		borderRadius: Math.max(borderRadius - inset, 0),
	});
</script>

<Rectangle
	x={props.x}
	y={props.y}
	anchor={props.anchor}
	width={props.width}
	height={props.height}
	{borderRadius}
	backgroundColor={PANEL_FILL}
	backgroundAlpha={props.backgroundAlpha ?? 0.92}
	borderColor={PANEL_BORDER}
	{borderWidth}
/>

<Rectangle
	x={rim.x}
	y={rim.y}
	anchor={props.anchor}
	width={rim.width}
	height={rim.height}
	borderRadius={rim.borderRadius}
	backgroundAlpha={0}
	borderColor={PANEL_RIM}
	borderWidth={1}
	borderAlpha={0.5}
/>
