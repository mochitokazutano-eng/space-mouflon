<script lang="ts">
	import { Text } from 'pixi-svelte';
	import { WHITE } from 'constants-shared/colors';

	import { UI_BASE_FONT_SIZE } from '../constants';

	type Props = {
		label: string;
		value: string;
		tiled?: boolean; // kept for caller compatibility; the minimal style has no plate art
		stacked?: boolean;
	};

	const props: Props = $props();

	// Minimal studio-standard style (see MOCHI_UI_PLAN.md): no plate art —
	// a muted, letter-spaced label over a bold white value, floating on the bar strip.
	const labelStyle = {
		fontFamily: 'Orbitron',
		fontSize: UI_BASE_FONT_SIZE * 0.52,
		letterSpacing: 3,
		fill: 0xe8ecf4,
	} as const;

	const valueStyle = {
		fontFamily: 'Orbitron',
		fontWeight: '600',
		fontSize: UI_BASE_FONT_SIZE * 0.92,
		fill: WHITE,
	} as const;
</script>

{#if props.stacked}
	<Text anchor={{ x: 0.5, y: 0 }} text={props.label} style={labelStyle} />
	<Text
		anchor={{ x: 0.5, y: 0 }}
		text={props.value}
		style={valueStyle}
		y={UI_BASE_FONT_SIZE * 0.62}
	/>
{:else}
	<Text anchor={{ x: 0, y: 0.5 }} text={props.label} style={labelStyle} />
	<Text
		anchor={{ x: 1, y: 0.5 }}
		text={props.value}
		style={valueStyle}
		x={UI_BASE_FONT_SIZE * 10}
	/>
{/if}
