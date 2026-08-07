<script lang="ts">
	import { stateUi } from 'state-shared';
	import { BLACK } from 'constants-shared/colors';
	import { MainContainer } from 'components-layout';
	import { Container, Rectangle, anchorToPivot } from 'pixi-svelte';

	import { LANDSCAPE_BASE_SIZE, LANDSCAPE_BACKGROUND_WIDTH_LIST } from '../constants';
	import type { LayoutUiProps } from '../types';
	import { getContext } from '../context';

	const props: LayoutUiProps = $props();
	const context = getContext();

	// Same one-row strip as desktop, scaled for short/small landscape canvases —
	// popout windows land here too (see MOCHI_UI_PLAN.md). Slots are fractions of the
	// strip width so they hold their proportions at any popout size.
	const STRIP_WIDTH = LANDSCAPE_BACKGROUND_WIDTH_LIST.reduce((sum, width) => sum + width, 0);
	const BAR_CENTER_Y = LANDSCAPE_BASE_SIZE * 0.5;
	const at = (fraction: number) => STRIP_WIDTH * fraction;
</script>

<Container x={20}>
	{@render props.gameName()}
</Container>

<Container x={context.stateLayoutDerived.canvasSizes().width * 0.5}>
	{@render props.logo()}
</Container>

<MainContainer standard alignVertical="bottom">
	<Container
		x={context.stateLayoutDerived.mainLayoutStandard().width * 0.5}
		y={context.stateLayoutDerived.mainLayoutStandard().height - LANDSCAPE_BASE_SIZE - 40}
		pivot={anchorToPivot({
			anchor: { x: 0.5, y: 0 },
			sizes: { height: LANDSCAPE_BASE_SIZE, width: STRIP_WIDTH },
		})}
	>
		<Rectangle
			anchor={0.5}
			x={STRIP_WIDTH * 0.5}
			y={BAR_CENTER_Y}
			width={STRIP_WIDTH * 3}
			height={LANDSCAPE_BASE_SIZE + 40}
			backgroundColor={BLACK}
			alpha={0.45}
		/>

		<Container y={BAR_CENTER_Y} x={at(0.05)} scale={0.7}>
			{@render props.buttonBuyBonus({ anchor: 0.5 })}
		</Container>

		<Container y={BAR_CENTER_Y} x={at(0.13)} scale={0.6}>
			{@render props.buttonMenu({ anchor: 0.5 })}
		</Container>

		<Container y={BAR_CENTER_Y - 42} x={at(0.27)} scale={0.72}>
			{@render props.amountBalance({ stacked: true })}
		</Container>

		<Container y={BAR_CENTER_Y - 42} x={at(0.47)} scale={0.72}>
			{@render props.amountWin({ stacked: true })}
		</Container>

		<Container y={BAR_CENTER_Y - 42} x={at(0.67)} scale={0.72}>
			{@render props.amountBet({ stacked: true })}
		</Container>

		<Container y={BAR_CENTER_Y - 34} x={at(0.76)} scale={0.4}>
			{@render props.buttonIncrease({ anchor: 0.5 })}
		</Container>

		<Container y={BAR_CENTER_Y + 34} x={at(0.76)} scale={0.4}>
			{@render props.buttonDecrease({ anchor: 0.5 })}
		</Container>

		<Container y={BAR_CENTER_Y} x={at(0.87)} scale={0.9}>
			{@render props.buttonBet({ anchor: 0.5 })}
		</Container>

		<Container y={BAR_CENTER_Y - 34} x={at(0.96)} scale={0.45}>
			{@render props.buttonAutoSpin({ anchor: 0.5 })}
		</Container>

		<Container y={BAR_CENTER_Y + 34} x={at(0.96)} scale={0.45}>
			{@render props.buttonTurbo({ anchor: 0.5 })}
		</Container>
	</Container>
</MainContainer>

{#if stateUi.menuOpen}
	<Rectangle
		eventMode="static"
		cursor="pointer"
		alpha={0.5}
		anchor={0.5}
		backgroundColor={BLACK}
		width={context.stateLayoutDerived.canvasSizes().width}
		height={context.stateLayoutDerived.canvasSizes().height}
		x={context.stateLayoutDerived.canvasSizes().width * 0.5}
		y={context.stateLayoutDerived.canvasSizes().height * 0.5}
		onpointerup={() => (stateUi.menuOpen = false)}
	/>

	<MainContainer standard alignVertical="bottom">
		<Container
			x={165}
			y={context.stateLayoutDerived.mainLayoutStandard().height - LANDSCAPE_BASE_SIZE - 130}
		>
			<Container scale={0.6} y={LANDSCAPE_BASE_SIZE * 0.5 - 130 * 4}>
				{@render props.buttonPayTable({ anchor: 0.5 })}
			</Container>

			<Container scale={0.6} y={LANDSCAPE_BASE_SIZE * 0.5 - 130 * 3}>
				{@render props.buttonGameRules({ anchor: 0.5 })}
			</Container>

			<Container scale={0.6} y={LANDSCAPE_BASE_SIZE * 0.5 - 130 * 2}>
				{@render props.buttonSettings({ anchor: 0.5 })}
			</Container>

			<Container scale={0.6} y={LANDSCAPE_BASE_SIZE * 0.5 - 130}>
				{@render props.buttonSoundSwitch({ anchor: 0.5 })}
			</Container>

			<Container scale={0.6} y={LANDSCAPE_BASE_SIZE * 0.5}>
				{@render props.buttonMenuClose({ anchor: 0.5 })}
			</Container>
		</Container>
	</MainContainer>
{/if}
