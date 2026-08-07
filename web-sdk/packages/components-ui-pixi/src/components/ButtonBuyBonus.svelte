<script lang="ts">
	import { Text } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { stateModal, stateBet, stateBetDerived, DEFAULT_BET_MODE_KEY } from 'state-shared';

	import UiSprite from './UiSprite.svelte';
	import { UI_BASE_FONT_SIZE, UI_BASE_SIZE } from '../constants';
	import { getContext } from '../context';
	import { i18nDerived } from '../i18n/i18nDerived';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const { stateXstateDerived, eventEmitter } = getContext();

	// Minimal round badge (studio standard, see MOCHI_UI_PLAN.md): flat dark circle,
	// thin ring, two-line label. The ring turns gold while a bet mode is armed.
	const D = UI_BASE_SIZE * 1.15;
	const sizes = { width: D + 8, height: D + 8 };
	const disabled = $derived(!stateXstateDerived.isIdle());
	const active = $derived(stateBetDerived.activeBetMode()?.type === 'activate');

	const openModal = () => (stateModal.modal = { name: 'buyBonus' });
	const disableActiveBetMode = () => (stateBet.activeBetModeKey = DEFAULT_BET_MODE_KEY);
	const onpress = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });

		if (active) {
			disableActiveBetMode();
		} else {
			openModal();
		}
	};

	const RING_IDLE = 0x9aa3b5;
	const RING_ACTIVE = 0xd4af37;
	const FILL = 0x141927;
</script>

<Button {...props} {sizes} {disabled} {onpress}>
	{#snippet children({ center, hovered, pressed })}
		<!-- ring -->
		<UiSprite
			{...center}
			anchor={0.5}
			width={D + 8}
			height={D + 8}
			borderRadius={(D + 8) * 0.5}
			backgroundColor={active ? RING_ACTIVE : RING_IDLE}
			alpha={disabled ? 0.25 : active ? 0.9 : hovered ? 0.7 : 0.45}
		/>
		<!-- face -->
		<UiSprite
			{...center}
			anchor={0.5}
			width={D}
			height={D}
			borderRadius={D * 0.5}
			backgroundColor={FILL}
			alpha={pressed ? 0.75 : 0.92}
		/>
		<Text
			{...center}
			anchor={0.5}
			text={active ? i18nDerived.disable() : i18nDerived.buyBonus()}
			style={{
				align: 'center',
				wordWrap: true,
				wordWrapWidth: D * 0.9,
				fontFamily: 'Orbitron',
				fontWeight: '600',
				fontSize: UI_BASE_FONT_SIZE * 0.58,
				letterSpacing: 1,
				fill: disabled ? 0x888888 : active ? RING_ACTIVE : 0xffffff,
			}}
		/>
	{/snippet}
</Button>
