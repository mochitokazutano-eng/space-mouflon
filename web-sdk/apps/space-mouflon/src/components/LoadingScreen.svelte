<script lang="ts">
	import { Container, Sprite } from 'pixi-svelte';
	import { FadeContainer, LoadingProgress } from 'components-pixi';
	import { MainContainer } from 'components-layout';

	import { getContext } from '../game/context';
	import TransitionAnimation from './TransitionAnimation.svelte';
	import PressToContinue from './PressToContinue.svelte';

	type Props = {
		onloaded: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	let loadingType = $state<'start' | 'transition'>('start');

	// Full-bleed splash: pick portrait vs landscape art like Background, cover-fit to the canvas.
	const isPortrait = $derived(context.stateLayoutDerived.isStacked());
	const splash = $derived.by(() => {
		const { width, height } = context.stateLayoutDerived.canvasSizes();
		const imageRatio = isPortrait ? 1080 / 1920 : 1920 / 1080;
		const canvasRatio = width / height;
		const cover =
			canvasRatio > imageRatio
				? { width, height: width / imageRatio }
				: { width: height * imageRatio, height };
		return {
			key: isPortrait ? 'screenPortrait' : 'screenLandscape',
			x: width * 0.5,
			y: height * 0.5,
			...cover,
		};
	});
</script>

<!-- splash and loading progress -->
<FadeContainer show={loadingType === 'start'}>
	<Sprite anchor={0.5} {...splash} />
	<MainContainer>
		<Container
			x={context.stateLayoutDerived.mainLayout().width * 0.5}
			y={context.stateLayoutDerived.mainLayout().height * 0.5}
		>
			{#if !context.stateApp.loaded}
				<LoadingProgress y={250} width={1967 * 0.2} height={346 * 0.2}>
					{#snippet background(sizes)}
						<Sprite key="progressBarBackground.png" {...sizes} />
					{/snippet}
					{#snippet progress(sizes)}
						<Sprite key="progressBar.png" {...sizes} />
					{/snippet}
					{#snippet frame(sizes)}
						<Sprite key="progressBarFrame.png" {...sizes} />
					{/snippet}
				</LoadingProgress>
			{/if}
		</Container>
	</MainContainer>
</FadeContainer>

<!-- press to continue -->
<FadeContainer show={loadingType === 'start' && context.stateApp.loaded}>
	<PressToContinue onpress={() => (loadingType = 'transition')} />
</FadeContainer>

<!-- transition between the loading screen and the game -->
<FadeContainer show={loadingType === 'transition'}>
	<TransitionAnimation oncomplete={props.onloaded} />
</FadeContainer>
