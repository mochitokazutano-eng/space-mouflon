<script lang="ts" module>
	import type { SharedAssetPixiKey } from 'constants-shared/assets';
	import type { ButtonIcon } from '../types';

	/**
	 * Icon art per button. `scale` is the sprite's size as a fraction of the button box.
	 * The +/- art is a whole button, so it fills the box; the bare glyphs are scaled off
	 * how much of their canvas the glyph actually covers, so they all read the same size.
	 * An icon with no entry here keeps the SDK's text label, on a pill.
	 */
	const ICON_ART_MAP: Partial<Record<ButtonIcon, { key: SharedAssetPixiKey; scale: number }>> = {
		increase: { key: 'ui_icon_increase', scale: 1 },
		decrease: { key: 'ui_icon_decrease', scale: 1 },
		menu: { key: 'ui_icon_menu', scale: 1 },
		turbo: { key: 'ui_icon_turbo', scale: 0.85 },
		autoSpin: { key: 'ui_icon_autospin', scale: 0.8 },
		info: { key: 'ui_icon_info', scale: 0.75 },
		payTable: { key: 'ui_icon_paytable', scale: 0.8 },
		menuExit: { key: 'ui_icon_close', scale: 0.8 },
		settings: { key: 'ui_icon_settings', scale: 0.9 },
		soundOn: { key: 'ui_icon_sound_on', scale: 0.9 },
		soundOff: { key: 'ui_icon_sound_off', scale: 0.9 },
	};

	const ACTIVE_TINT = 0x241a4d; // dark, for content sitting on the gold "on" pill
	const DISABLED_TINT = 0x888888;
</script>

<script lang="ts">
	import { Text } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';

	import UiSprite from './UiSprite.svelte';
	import type { Snippet } from 'svelte';
	import { i18nDerived } from '../i18n/i18nDerived';
	import { UI_BASE_FONT_SIZE } from '../constants';

	type Props = Omit<ButtonProps, 'children'> & {
		icon: ButtonIcon;
		sizes: { width: number; height: number };
		active?: boolean;
		children?: Snippet;
		variant?: 'dark' | 'light';
	};

	const {
		icon,
		active,
		// Destructured to keep it off `buttonProps` (and so off the pixi container). Every
		// `light` button carries icon art now, so the light/dark split has nothing left to do.
		variant: _variant = 'dark',
		children: childrenFromParent,
		...buttonProps
	}: Props = $props();

	const art = $derived(ICON_ART_MAP[icon]);
	const iconTint = $derived.by(() => {
		if (buttonProps.disabled) return DISABLED_TINT;
		return undefined;
	});
</script>

<Button {...buttonProps}>
	{#snippet children({ center, hovered, pressed })}
		{#if art}
			<!-- Transparent hit target, so shrinking the visual to an icon keeps the press area. -->
			<UiSprite
				{...center}
				anchor={0.5}
				width={buttonProps.sizes.width}
				height={buttonProps.sizes.height}
				backgroundAlpha={0}
			/>

			<!-- Kept mounted and faded instead of {#if}-ed: a pixi child added later lands on
			     top of the icon, which would hide it the moment the button went active. -->
			<UiSprite
				key={art.key}
				{...center}
				anchor={0.5}
				width={buttonProps.sizes.width * art.scale * 1.18}
				height={buttonProps.sizes.height * art.scale * 1.18}
				blendMode="add"
				alpha={active && !buttonProps.disabled ? 0.8 : 0}
			/>

			<UiSprite
				key={art.key}
				{...center}
				anchor={0.5}
				width={buttonProps.sizes.width * art.scale}
				height={buttonProps.sizes.height * art.scale}
				alpha={buttonProps.disabled ? 0.5 : 1}
				{...iconTint === undefined ? {} : { tint: iconTint }}
			/>
		{:else}
			<UiSprite
				key={active ? 'ui_pill_on' : 'ui_pill_off'}
				{...center}
				anchor={0.5}
				width={buttonProps.sizes.width}
				height={buttonProps.sizes.height}
				{...buttonProps.disabled ? { tint: DISABLED_TINT } : {}}
			/>

			<Text
				{...center}
				anchor={0.5}
				text={i18nDerived[icon]()}
				style={{
					align: 'center',
					wordWrap: true,
					wordWrapWidth: 200,
					fontFamily: 'Figtree',
					fontWeight: '600',
					fontSize: UI_BASE_FONT_SIZE * 0.9,
					fill: active ? ACTIVE_TINT : 0xffffff,
				}}
			/>
		{/if}

		{@render childrenFromParent?.()}
	{/snippet}
</Button>
