<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { sineInOut, backOut, cubicOut } from 'svelte/easing';

	import { Container, Sprite } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	// Desktop only: he's board-anchored, and portrait/landscape/popout canvases have no
	// room beside the reels (see MOCHI_UI_PLAN.md).
	const showCharacter = $derived(context.stateLayoutDerived.layoutType() === 'desktop');

	// Art: mouflon_idle 531x720, mouflon_win 538x720 (transparent cutouts).
	const CHAR_HEIGHT = SYMBOL_SIZE * 3.1;
	const IDLE_WIDTH = CHAR_HEIGHT * (531 / 720);
	const WIN_WIDTH = CHAR_HEIGHT * (538 / 720);

	// Feet planted just outside the frame's bottom-left corner.
	const feet = $derived({
		x: -SYMBOL_SIZE * 0.4 - Math.max(IDLE_WIDTH, WIN_WIDTH) * 0.5,
		y: context.stateGameDerived.boardLayout().height - SYMBOL_SIZE * 0.35,
	});

	// Breathing: slow sine loop, scaling from the feet so he rises and settles.
	const breath = new Tween(0);
	// Win pose: crossfade + small pop, then ease back to idle.
	const winPose = new Tween(0);
	let winToken = 0;

	$effect(() => {
		let alive = true;
		(async () => {
			while (alive) {
				await breath.set(1, { duration: 1900, easing: sineInOut });
				await breath.set(0, { duration: 1900, easing: sineInOut });
			}
		})();
		return () => {
			alive = false;
		};
	});

	const onWin = async () => {
		const token = ++winToken;
		winPose.set(1, { duration: 450, easing: backOut });
		await waitForTimeout(1400);
		if (token === winToken) {
			winPose.set(0, { duration: 650, easing: cubicOut });
		}
	};

	context.eventEmitter.subscribeOnMount({
		tumbleWinAmountUpdate: (emitterEvent: { amount: number }) => {
			if (emitterEvent.amount > 0) void onWin();
		},
	});

	const scaleY = $derived(1 + breath.current * 0.022 + winPose.current * 0.05);
	const scaleX = $derived(1 + winPose.current * 0.03);
</script>

{#if showCharacter}
<BoardContainer>
	<Container x={feet.x} y={feet.y - winPose.current * 10} scale={{ x: scaleX, y: scaleY }}>
		<Sprite
			key="mouflonIdle"
			anchor={{ x: 0.5, y: 1 }}
			width={IDLE_WIDTH}
			height={CHAR_HEIGHT}
			alpha={1 - winPose.current}
		/>
		<Sprite
			key="mouflonWin"
			anchor={{ x: 0.5, y: 1 }}
			width={WIN_WIDTH}
			height={CHAR_HEIGHT}
			alpha={winPose.current}
		/>
	</Container>
</BoardContainer>
{/if}
