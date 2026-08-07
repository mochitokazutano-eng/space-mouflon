<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';

	type Props = {
		show: boolean;
		children: Snippet;
	};

	const props: Props = $props();
	const context = getContext();

	// Docked left-of-centre: the top-centre slot now belongs to the game logo
	// (studio-standard layout, see MOCHI_UI_PLAN.md); mirrors the FS multiplier
	// tracker which lives top-right.
	const desktopPosition = $derived({
		x: SYMBOL_SIZE * 0.8 * (400 / 144) * 0.5,
		y: -SYMBOL_SIZE * 0.8 * 0.58,
	});

	const portraitPosition = $derived({
		x:
			context.stateGameDerived.boardLayout().width *
			(context.stateGame.gameType === 'basegame' ? 0.5 : 0.37),
		y: -SYMBOL_SIZE * 0.8 * 0.68,
	});

	const position = $derived(
		context.stateLayoutDerived.isStacked() ? portraitPosition : desktopPosition,
	);

	const scale = $derived(context.stateLayoutDerived.isStacked() ? 1.28 : 1);
</script>

<FadeContainer show={props.show}>
	<BoardContainer>
		<Container {...position} {scale}>
			{@render props.children()}
		</Container>
	</BoardContainer>
</FadeContainer>
