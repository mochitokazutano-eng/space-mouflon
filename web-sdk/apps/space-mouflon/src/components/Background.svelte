<script lang="ts">
	import { Rectangle, Sprite } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { SECOND } from 'constants-shared/time';

	import { getContext } from '../game/context';
	import { BACKGROUND_RATIO, PORTRAIT_BACKGROUND_RATIO } from '../game/constants';

	const context = getContext();

	// TODO(Step 7): this only picks portrait vs landscape art; the full portrait layout pass is later.
	const isPortrait = $derived(context.stateLayoutDerived.isStacked());
	const ratio = $derived(isPortrait ? PORTRAIT_BACKGROUND_RATIO : BACKGROUND_RATIO);
	const layout = $derived(
		isPortrait
			? context.stateLayoutDerived.portraitBackgroundLayout({ scale: 1 })
			: context.stateLayoutDerived.normalBackgroundLayout({ scale: 1 }),
	);
	const backgroundProps = $derived(
		'height' in layout
			? { x: layout.x, y: layout.y, height: layout.height, width: layout.height * ratio }
			: { x: layout.x, y: layout.y, width: layout.width, height: layout.width / ratio },
	);

	const showBaseBackground = $derived(context.stateGame.gameType === 'basegame');
	const showFeatureBackground = $derived(context.stateGame.gameType === 'freeSpins');
</script>

<Rectangle {...context.stateLayoutDerived.canvasSizes()} backgroundColor={0x000000} zIndex={-3} />

<FadeContainer show={showBaseBackground} duration={SECOND} zIndex={-2}>
	<Sprite key={isPortrait ? 'bgBasePortrait' : 'bgBase'} anchor={0.5} {...backgroundProps} />
</FadeContainer>

<FadeContainer show={showFeatureBackground} duration={SECOND} zIndex={-1}>
	<Sprite
		key={isPortrait ? 'bgFreespinsPortrait' : 'bgFreespins'}
		anchor={0.5}
		{...backgroundProps}
	/>
</FadeContainer>
