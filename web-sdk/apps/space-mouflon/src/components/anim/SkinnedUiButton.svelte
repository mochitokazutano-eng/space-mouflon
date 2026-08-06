<script lang="ts" module>
	/**
	 * Art-skinned replacement for components-ui-pixi UiButton (WS-D).
	 * Kills the grey-Rectangle + proxima-nova fallback: every icon slot renders
	 * the mouflon-ui art with hover / press / disabled states in code.
	 *
	 * Merge SM_ICON_ART into the repo's existing icon map if one exists
	 * (docs call it ICON_ART_MAP); keys = ButtonIcon union from
	 * components-ui-pixi/types.ts, values = asset keys registered in assets.ts.
	 */
	import type { ButtonIcon } from 'components-ui-pixi'; // adjust if types aren't re-exported

	export const SM_ICON_ART: Record<ButtonIcon, string> = {
		decrease: 'smBtnMinus',
		increase: 'smBtnPlus',
		menu: 'smIconMenu',
		menuExit: 'smIconClose',
		turbo: 'smIconBolt',
		autoSpin: 'smIconAuto',
		payTable: 'smIconPaytable',
		info: 'smIconInfo',
		settings: 'smIconSettings',
		soundOn: 'smIconSoundOn',
		soundOff: 'smIconSoundOff',
	};
</script>

<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import type { Snippet } from 'svelte';

	type Props = Omit<ButtonProps, 'children'> & {
		icon: ButtonIcon;
		sizes: { width: number; height: number };
		active?: boolean;
		children?: Snippet;
	};

	const { icon, active, children: childrenFromParent, ...buttonProps }: Props = $props();
</script>

<Button {...buttonProps}>
	{#snippet children({ center, hovered, pressed })}
		{@const s = pressed ? 0.92 : hovered ? 1.06 : 1}
		<Sprite
			{...center}
			anchor={0.5}
			key={SM_ICON_ART[icon]}
			width={buttonProps.sizes.width * 0.62 * s}
			height={buttonProps.sizes.height * 0.62 * s}
			alpha={buttonProps.disabled ? 0.45 : 1}
		/>
		{#if hovered && !buttonProps.disabled}
			<!-- additive self-glow on hover — no extra art needed -->
			<Sprite
				{...center}
				anchor={0.5}
				key={SM_ICON_ART[icon]}
				width={buttonProps.sizes.width * 0.62 * s}
				height={buttonProps.sizes.height * 0.62 * s}
				blendMode="add"
				alpha={0.5}
			/>
		{/if}
		{#if active}
			<!-- active ring: reuse the pill_on art stretched thin under the icon -->
			<Sprite
				{...center}
				anchor={0.5}
				key="smPillOn"
				width={buttonProps.sizes.width * 0.95}
				height={buttonProps.sizes.height * 0.28}
				y={center.y + buttonProps.sizes.height * 0.38}
				alpha={0.9}
			/>
		{/if}
		{@render childrenFromParent?.()}
	{/snippet}
</Button>
