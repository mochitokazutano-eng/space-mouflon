<script lang="ts">
	import { Text, BitmapText } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { stateModal, stateBet, stateBetDerived, DEFAULT_BET_MODE_KEY } from 'state-shared';

	import UiSprite from './UiSprite.svelte';
	import { UI_BASE_FONT_SIZE, UI_BASE_SIZE } from '../constants';
	import { getContext } from '../context';
	import { i18nDerived } from '../i18n/i18nDerived';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const { stateXstateDerived, eventEmitter } = getContext();
	const sizes = { width: UI_BASE_SIZE * 1.5, height: UI_BASE_SIZE };
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

	const getState = (value: {
		active: boolean;
		disabled: boolean;
		hovered: boolean;
		pressed: boolean;
	}) => {
		if (value.disabled) return 'disabled' as const;
		if (value.pressed) return 'pressed' as const;
		if (value.hovered) return 'hovered' as const;
		if (value.active) return 'active' as const;
		return 'default' as const;
	};
</script>

<Button {...props} {sizes} {disabled} {onpress}>
	{#snippet children({ center, hovered, pressed })}
		{@const state = getState({
			active,
			disabled,
			hovered,
			pressed,
		})}

		<!-- Gold when idle, so the buy-bonus call to action carries the same gold as the spin
		     button and the steppers; the dark pill marks the armed "DISABLE" state. -->
		<UiSprite
			key={active ? 'ui_plate_wide' : 'ui_btn_bonus'}
			{...center}
			anchor={0.5}
			width={sizes.width}
			height={sizes.width * (active ? 144 / 800 : 200 / 480)}
			{...disabled
				? {
						backgroundColor: 0xaaaaaa,
					}
				: {}}
		/>

		{#if state === 'active'}
			<BitmapText
				{...center}
				anchor={0.5}
				text={i18nDerived.disable()}
				style={{ fontFamily: 'gold', fontSize: UI_BASE_FONT_SIZE * 0.95 }}
			/>
		{/if}
	{/snippet}
</Button>
