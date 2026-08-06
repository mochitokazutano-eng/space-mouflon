<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { Sprite } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import BoardFrameGlow from './anim/BoardFrameGlow.svelte';

	const context = getContext();

	// frame_reels.png: gold rim opening is ~98% of the full image (thin border), so the
	// sprite must be slightly larger than the board for the opening to line up with it.
	const FRAME_SCALE = { width: 1960 / 1920, height: 1680 / 1640 };

	context.eventEmitter.subscribeOnMount({
		// no board-frame glow in v1 (5a's background swap already signals the mode change)
		boardFrameGlowShow: () => {},
		boardFrameGlowHide: () => {},
	});
</script>

<Sprite
	key="frameReels"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x}
	y={context.stateGameDerived.boardLayout().y}
	width={context.stateGameDerived.boardLayout().width * FRAME_SCALE.width}
	height={context.stateGameDerived.boardLayout().height * FRAME_SCALE.height}
/>
<BoardFrameGlow />
