<script lang="ts" module>
	import { UI_BASE_SIZE, UI_BASE_FONT_SIZE } from '../constants';

	/**
	 * Portrait geometry.
	 *
	 * Everything below lives in the standard main layout's design box (1080x1920), which
	 * MainContainer scales by min(canvasW/1080, canvasH/1920) and centres. That scale means the
	 * design box never overflows the canvas horizontally, so a margin expressed in design units
	 * is always a real on-screen margin — 5% of the box is 18px on a 360px-wide phone.
	 *
	 * Positions are therefore derived from the box and each element's own half-size rather than
	 * hardcoded offsets, and clamped so no element's edge can cross the safe area.
	 */
	const DESIGN = { width: 1080, height: 1920 };
	const SIDE_MARGIN = DESIGN.width * 0.05;
	const BOTTOM_MARGIN = 60;
	const ROW_GAP = 45;

	const BUTTON_HALF = UI_BASE_SIZE * 0.5;
	const MENU_BUTTON_HALF = UI_BASE_SIZE * 1.3 * 0.5;

	// A stacked <UiLabel> draws its plate from y - PLATE_RISE to y + PLATE_DROP.
	const PLATE_RISE = 20;
	const PLATE_HEIGHT = UI_BASE_FONT_SIZE * 3;
	const PLATE_DROP = PLATE_HEIGHT - PLATE_RISE;
	const PLATE_HALF_WIDTH = UI_BASE_FONT_SIZE * 3 * (326 / 73) * 0.5;

	const clampX = (x: number, halfWidth: number) =>
		Math.min(
			Math.max(x, SIDE_MARGIN + halfWidth),
			DESIGN.width - SIDE_MARGIN - halfWidth,
		);

	const CENTER_X = DESIGN.width * 0.5;
	const EDGE_LEFT = clampX(0, BUTTON_HALF);
	const EDGE_RIGHT = clampX(DESIGN.width, BUTTON_HALF);
	// Five evenly spaced button slots between the two safe edges.
	const SLOT_STEP = (EDGE_RIGHT - EDGE_LEFT) / 4;
	const SLOT = [0, 1, 2, 3, 4].map((index) => EDGE_LEFT + SLOT_STEP * index);

	// Rows, stacked upward from the bottom safe margin so the bottom row is never cut off.
	const BET_PLATE_Y = DESIGN.height - BOTTOM_MARGIN - PLATE_DROP;
	const BET_ROW_Y = DESIGN.height - BOTTOM_MARGIN - BUTTON_HALF;
	const BALANCE_PLATE_Y = BET_PLATE_Y - PLATE_RISE - ROW_GAP - PLATE_DROP;
	const BUTTON_ROW_Y = BALANCE_PLATE_Y - PLATE_RISE - ROW_GAP - BUTTON_HALF;
	const WIN_PLATE_Y = BUTTON_ROW_Y - BUTTON_HALF - ROW_GAP - PLATE_DROP;
	// Right edge of the win row. The plates are narrower than the safe width, so this column is
	// free, and it is the only row the steppers never occupy — the drawer button and the bet
	// row can be on screen at the same time.
	const DRAWER_BUTTON_Y = WIN_PLATE_Y + PLATE_HEIGHT * 0.5 - PLATE_RISE;
	const MENU_COLUMN_X = clampX(EDGE_LEFT, MENU_BUTTON_HALF);

	// Steppers flank the bet plate: outside its edge by a gap, then pulled back inside the
	// safe area on narrow screens (where they end up sitting at the safe edges).
	const STEPPER_LEFT_X = clampX(CENTER_X - PLATE_HALF_WIDTH - ROW_GAP - BUTTON_HALF, BUTTON_HALF);
	const STEPPER_RIGHT_X = clampX(CENTER_X + PLATE_HALF_WIDTH + ROW_GAP + BUTTON_HALF, BUTTON_HALF);
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

	const DRAWER_Y = {
		unfold: 0,
		fold: 550,
	};
	const drawerTween = new Tween(stateUi.drawerFold ? DRAWER_Y.fold : DRAWER_Y.unfold, {
		easing: cubicInOut,
	});

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
				await drawerTween.set(DRAWER_Y.unfold);
			}
		},
		drawerFold: async () => {
			if (!stateUi.drawerFold) {
				drawerButtonTween.set(DRAWER_BUTTON_OFFSET_Y.fold);
				await drawerTween.set(DRAWER_Y.fold);
			}
		},
	});
</script>

<Container x={canvasMargin}>
	{@render props.gameName()}
</Container>

<Container x={context.stateLayoutDerived.canvasSizes().width - canvasMargin}>
	{@render props.logo()}
</Container>

<MainContainer standard alignVertical="bottom">
	<!-- drawer container -->
	<Container y={drawerTween.current}>
		<Container x={SLOT[0]} y={BUTTON_ROW_Y}>
			{@render props.buttonMenu({ anchor: 0.5 })}
		</Container>

		<Container x={SLOT[1]} y={BUTTON_ROW_Y}>
			{@render props.buttonAutoSpin({ anchor: 0.5 })}
		</Container>

		<Container x={SLOT[2]} y={BUTTON_ROW_Y}>
			{@render props.buttonBet({ anchor: 0.5 })}
		</Container>

		<Container x={SLOT[3]} y={BUTTON_ROW_Y}>
			{@render props.buttonTurbo({ anchor: 0.5 })}
		</Container>

		<Container x={SLOT[4]} y={BUTTON_ROW_Y}>
			{@render props.buttonBuyBonus({ anchor: 0.5 })}
		</Container>

		<Container x={CENTER_X} y={BALANCE_PLATE_Y}>
			{@render props.amountBalance({ stacked: true })}
		</Container>
	</Container>

	<Container y={Math.min(drawerTween.current, 350)}>
		<Container x={CENTER_X} y={WIN_PLATE_Y}>
			{@render props.amountWin({ stacked: true })}
		</Container>
	</Container>
</MainContainer>

<MainContainer standard alignVertical="bottom">
	{#if stateUi.freeSpinCounterShow}
		<Container x={CENTER_X} y={BET_PLATE_Y}>
			<LabelFreeSpinCounter stacked />
		</Container>
	{:else}
		<Container x={CENTER_X} y={BET_PLATE_Y}>
			{@render props.amountBet({ stacked: true })}
		</Container>

		<Container x={STEPPER_LEFT_X} y={BET_ROW_Y}>
			{@render props.buttonDecrease({ anchor: 0.5 })}
		</Container>

		<Container x={STEPPER_RIGHT_X} y={BET_ROW_Y}>
			{@render props.buttonIncrease({ anchor: 0.5 })}
		</Container>
	{/if}

	<!-- drawer button -->
	<FadeContainer
		persistent
		show={stateUi.drawerButtonShow}
		oncomplete={drawerButtonFadeComplete}
		y={drawerButtonTween.current}
	>
		<Container x={EDGE_RIGHT} y={DRAWER_BUTTON_Y}>
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
		<Container x={MENU_COLUMN_X} y={BUTTON_ROW_Y}>
			<Container y={-190 - 210 * 3}>
				{@render props.buttonPayTable({ anchor: 0.5 })}
			</Container>

			<Container y={-190 - 210 * 2}>
				{@render props.buttonGameRules({ anchor: 0.5 })}
			</Container>

			<Container y={-190 - 210 * 1}>
				{@render props.buttonSettings({ anchor: 0.5 })}
			</Container>

			<Container y={-190}>
				{@render props.buttonSoundSwitch({ anchor: 0.5 })}
			</Container>

			<Container>
				{@render props.buttonMenuClose({ anchor: 0.5 })}
			</Container>
		</Container>
	</MainContainer>
{/if}
