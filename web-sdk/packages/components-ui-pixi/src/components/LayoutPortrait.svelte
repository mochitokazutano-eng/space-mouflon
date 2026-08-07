<script lang="ts" module>
	import { UI_BASE_SIZE } from '../constants';

	/**
	 * Portrait geometry — one compact control strip, same reading order as desktop
	 * (see MOCHI_UI_PLAN.md): buy bonus · menu · balance · bet + stepper · spin.
	 *
	 * Everything lives in the standard main layout's design box (1080x1920), which
	 * MainContainer scales by min(canvasW/1080, canvasH/1920) and centres, so offsets
	 * expressed in design units stay proportional on every phone.
	 */
	const DESIGN = { width: 1080, height: 1920 };
	const SIDE_MARGIN = DESIGN.width * 0.05;

	const STRIP_HEIGHT = 240;
	const STRIP_CENTER_Y = DESIGN.height - 130;
	const STRIP_TOP_Y = STRIP_CENTER_Y - STRIP_HEIGHT * 0.5;

	// Strip slots, left to right.
	const BUY_X = 110;
	const MENU_X = 250;
	const BALANCE_X = 440;
	const BET_X = 700;
	const STEPPER_X = 830;
	const STEPPER_OFFSET_Y = 52;
	const SPIN_X = 965;

	// Row above the strip: win amount centred, auto/turbo tucked to the right.
	const UPPER_ROW_Y = STRIP_TOP_Y - 90;
	const AUTO_X = 900;
	const TURBO_X = 1010;

	const CENTER_X = DESIGN.width * 0.5;
	const EDGE_RIGHT = DESIGN.width - SIDE_MARGIN - UI_BASE_SIZE * 0.3;
</script>

<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	import { stateUi } from 'state-shared';
	import { BLACK } from 'constants-shared/colors';
	import { FadeContainer } from 'components-pixi';
	import { MainContainer } from 'components-layout';
	import { Container, Rectangle } from 'pixi-svelte';
	import { waitForResolve } from 'utils-shared/wait';

	import LabelFreeSpinCounter from './LabelFreeSpinCounter.svelte';
	import ButtonDrawer from './ButtonDrawer.svelte';
	import type { LayoutUiProps } from '../types';
	import { getContext } from '../context';

	const props: LayoutUiProps = $props();
	const context = getContext();

	// The logo sits in raw canvas space; keep it off the edge on narrow screens.
	const canvasMargin = $derived(
		Math.max(16, context.stateLayoutDerived.canvasSizes().width * 0.05),
	);

	const DRAWER_BUTTON_OFFSET_Y = {
		unfold: 0,
		fold: 50,
	};
	const drawerButtonTween = new Tween(
		stateUi.drawerFold ? DRAWER_BUTTON_OFFSET_Y.fold : DRAWER_BUTTON_OFFSET_Y.unfold,
		{
			easing: cubicInOut,
		},
	);

	let drawerButtonFadeComplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		drawerButtonShow: async () => {
			if (!stateUi.drawerButtonShow) {
				stateUi.drawerButtonShow = true;
				await waitForResolve((resolve) => (drawerButtonFadeComplete = resolve));
			}
		},
		drawerButtonHide: async () => {
			if (stateUi.drawerButtonShow) {
				stateUi.drawerButtonShow = false;
				await waitForResolve((resolve) => (drawerButtonFadeComplete = resolve));
			}
		},
		drawerUnfold: async () => {
			if (stateUi.drawerFold) {
				drawerButtonTween.set(DRAWER_BUTTON_OFFSET_Y.unfold);
			}
		},
		drawerFold: async () => {
			if (!stateUi.drawerFold) {
				drawerButtonTween.set(DRAWER_BUTTON_OFFSET_Y.fold);
			}
		},
	});
</script>

<Container x={canvasMargin}>
	{@render props.gameName()}
</Container>

<Container x={context.stateLayoutDerived.canvasSizes().width * 0.5}>
	{@render props.logo()}
</Container>

<MainContainer standard alignVertical="bottom">
	<!-- translucent strip, overshooting so it always reaches both canvas edges -->
	<Rectangle
		anchor={0.5}
		x={CENTER_X}
		y={STRIP_CENTER_Y}
		width={DESIGN.width * 3}
		height={STRIP_HEIGHT}
		backgroundColor={BLACK}
		alpha={0.45}
	/>

	<Container x={CENTER_X} y={UPPER_ROW_Y} scale={0.75}>
		{@render props.amountWin({ stacked: true })}
	</Container>

	<Container x={AUTO_X} y={UPPER_ROW_Y + 30} scale={0.45}>
		{@render props.buttonAutoSpin({ anchor: 0.5 })}
	</Container>

	<Container x={TURBO_X} y={UPPER_ROW_Y + 30} scale={0.45}>
		{@render props.buttonTurbo({ anchor: 0.5 })}
	</Container>

	<Container x={BUY_X} y={STRIP_CENTER_Y} scale={0.62}>
		{@render props.buttonBuyBonus({ anchor: 0.5 })}
	</Container>

	<Container x={MENU_X} y={STRIP_CENTER_Y} scale={0.55}>
		{@render props.buttonMenu({ anchor: 0.5 })}
	</Container>

	<Container x={BALANCE_X} y={STRIP_CENTER_Y - 40} scale={0.72}>
		{@render props.amountBalance({ stacked: true })}
	</Container>

	{#if stateUi.freeSpinCounterShow}
		<Container x={BET_X} y={STRIP_CENTER_Y - 40} scale={0.72}>
			<LabelFreeSpinCounter stacked />
		</Container>
	{:else}
		<Container x={BET_X} y={STRIP_CENTER_Y - 40} scale={0.72}>
			{@render props.amountBet({ stacked: true })}
		</Container>

		<Container x={STEPPER_X} y={STRIP_CENTER_Y - STEPPER_OFFSET_Y} scale={0.4}>
			{@render props.buttonIncrease({ anchor: 0.5 })}
		</Container>

		<Container x={STEPPER_X} y={STRIP_CENTER_Y + STEPPER_OFFSET_Y} scale={0.4}>
			{@render props.buttonDecrease({ anchor: 0.5 })}
		</Container>
	{/if}

	<Container x={SPIN_X} y={STRIP_CENTER_Y} scale={0.85}>
		{@render props.buttonBet({ anchor: 0.5 })}
	</Container>

	<!-- drawer button -->
	<FadeContainer
		persistent
		show={stateUi.drawerButtonShow}
		oncomplete={drawerButtonFadeComplete}
		y={drawerButtonTween.current}
	>
		<Container x={EDGE_RIGHT} y={UPPER_ROW_Y - 120}>
			<ButtonDrawer disabled={!stateUi.drawerButtonShow} anchor={0.5} />
		</Container>
	</FadeContainer>
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
		<Container x={MENU_X} y={STRIP_CENTER_Y}>
			<Container scale={0.55} y={-140 * 4}>
				{@render props.buttonPayTable({ anchor: 0.5 })}
			</Container>

			<Container scale={0.55} y={-140 * 3}>
				{@render props.buttonGameRules({ anchor: 0.5 })}
			</Container>

			<Container scale={0.55} y={-140 * 2}>
				{@render props.buttonSettings({ anchor: 0.5 })}
			</Container>

			<Container scale={0.55} y={-140}>
				{@render props.buttonSoundSwitch({ anchor: 0.5 })}
			</Container>

			<Container scale={0.55}>
				{@render props.buttonMenuClose({ anchor: 0.5 })}
			</Container>
		</Container>
	</MainContainer>
{/if}
