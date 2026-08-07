<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container, Sprite, type Sizes } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_DIMENSIONS } from '../game/constants';

	type Props = {
		children: Snippet<[{ sizes: Sizes }]>;
	};

	const props: Props = $props();
	const context = getContext();

	// The sample's wooden board was a Spine (fs_screen) whose contents rendered into one of its
	// slots. Our code-drawn panel replaces it, so the children now lay out in plain board units
	// around the panel centre instead of inheriting the slot's transform. Footprint unchanged.
	const PANEL_RATIO = 400 / 144;
	const PANEL_WIDTH = SYMBOL_SIZE * BOARD_DIMENSIONS.x * 0.95;
	const PANEL_SIZES = {
		width: PANEL_WIDTH,
		height: PANEL_WIDTH / PANEL_RATIO,
	};
</script>

<MainContainer>
	<Container
		x={context.stateGameDerived.boardLayout().x}
		y={context.stateGameDerived.boardLayout().y}
	>
		<Sprite anchor={0.5} key="plateValue" width={PANEL_SIZES.width} height={PANEL_SIZES.height} />
		{@render props.children({ sizes: PANEL_SIZES })}
	</Container>
</MainContainer>
