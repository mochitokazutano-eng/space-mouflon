<script lang="ts">
	/**
	 * Hero spin button (WS-D): btn_spin art with the full state set —
	 * idle breathing · hover glow · press squash · continuous ring rotation
	 * while spinning · disabled dim. Replaces the body of ButtonBet.svelte
	 * (keep ButtonBetProvider + OnHotkey exactly as stock — spacebar is a
	 * checklist requirement).
	 */
	import { onDestroy } from 'svelte';
	import { Container, Sprite } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { OnHotkey } from 'components-shared';
	import { stateBetDerived } from 'state-shared';

	import ButtonBetProvider from 'components-ui-pixi/src/components/ButtonBetProvider.svelte'; // match repo import style
	import { loopTween } from './timeline';
	import { UI_BASE_SIZE } from 'components-ui-pixi/src/constants'; // match repo import style

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const disabled = $derived(!stateBetDerived.isBetCostAvailable());
	const sizes = { width: UI_BASE_SIZE * 1.35, height: UI_BASE_SIZE * 1.35 };

	let breath = $state(1);
	let spinRot = $state(0);

	const cancelBreath = loopTween({
		duration: 2600,
		onUpdate: (t) => (breath = 1 + 0.02 * Math.sin(t * Math.PI * 2)),
	});
	// ring angle always advances (cheap); applied only while spinning
	const cancelSpin = loopTween({
		duration: 1400,
		onUpdate: (t) => (spinRot = t * Math.PI * 2),
	});
	onDestroy(() => {
		cancelBreath();
		cancelSpin();
	});
</script>

<ButtonBetProvider>
	{#snippet children({ key, onpress })}
		<OnHotkey hotkey="Space" {disabled} {onpress} />
		{@const spinning = key.startsWith('stop')}
		<Button {...props} {sizes} {onpress} {disabled}>
			{#snippet children({ center, hovered, pressed })}
				{@const s = (pressed ? 0.93 : hovered ? 1.05 : 1) * breath}
				<Container {...center} scale={s} rotation={spinning ? spinRot : 0}>
					<Sprite
						anchor={0.5}
						key="smBtnSpin"
						width={sizes.width}
						height={sizes.height}
						alpha={disabled ? 0.5 : 1}
					/>
					{#if hovered && !disabled}
						<Sprite
							anchor={0.5}
							key="smBtnSpin"
							width={sizes.width}
							height={sizes.height}
							blendMode="add"
							alpha={0.35}
						/>
					{/if}
				</Container>
			{/snippet}
		</Button>
	{/snippet}
</ButtonBetProvider>
