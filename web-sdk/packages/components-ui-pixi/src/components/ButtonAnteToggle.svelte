<script lang="ts">
	/**
	 * Double Chance toggle on the MAIN screen (WS-D) — answers the reviewer
	 * complaint that the ante mode is invisible inside the bet menu.
	 * Renders beside the Bonus Buy button (offset from its layout slot) using
	 * the toggle_ante art; pressing flips the activate-type bet mode on/off.
	 */
	import { Button, type ButtonProps } from 'components-pixi';
	import { stateBet, stateMeta, DEFAULT_BET_MODE_KEY } from 'state-shared';
	import UiSprite from './UiSprite.svelte';
	import { UI_BASE_SIZE } from '../constants';
	import { getContext } from '../context';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const { stateXstateDerived, eventEmitter } = getContext();

	const anteKey = $derived(
		Object.keys(stateMeta.betModeMeta).find(
			(key) => stateMeta.betModeMeta[key].type === 'activate',
		),
	);
	const active = $derived(stateBet.activeBetModeKey === anteKey);
	const disabled = $derived(!stateXstateDerived.isIdle() || !anteKey);
	const sizes = { width: UI_BASE_SIZE * 1.5, height: UI_BASE_SIZE * 0.55 };

	const onpress = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBet.activeBetModeKey = active ? DEFAULT_BET_MODE_KEY : (anteKey as string);
	};
</script>

<Button
	{...props}
	x={(props.x ?? 0) + UI_BASE_SIZE * 1.7}
	y={props.y ?? 0}
	{sizes}
	{disabled}
	{onpress}
>
	{#snippet children({ center, hovered })}
		<UiSprite
			key={active ? 'ui_toggle_ante_on' : 'ui_toggle_ante_off'}
			{...center}
			anchor={0.5}
			width={sizes.width}
			height={sizes.width * (120 / 440)}
			alpha={disabled ? 0.6 : 1}
		/>
		{#if hovered && !disabled}
			<UiSprite
				key={active ? 'ui_toggle_ante_on' : 'ui_toggle_ante_off'}
				{...center}
				anchor={0.5}
				width={sizes.width}
				height={sizes.width * (120 / 440)}
				blendMode="add"
				alpha={0.35}
			/>
		{/if}
	{/snippet}
</Button>
