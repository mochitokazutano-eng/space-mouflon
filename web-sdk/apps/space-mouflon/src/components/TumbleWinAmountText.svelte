<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { Container } from 'pixi-svelte';
	import { ResponsiveBitmapText } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { SYMBOL_SIZE, GOLD_TEXT_TINT } from '../game/constants';
	import { runTimeline, ramp, rampOut } from '../game/timeline.svelte';
	import Burst from './Burst.svelte';

	type Props = {
		width: number;
		amount: number;
		animate: boolean;
		oncomplete: () => void;
	};
	const props: Props = $props();

	// Beat map lifted from the tumble_win rig this replaces, so the cascade
	// cadence is unchanged:
	//   0.133  explosion appears
	//   0.200  text fades out
	//   0.300  text value swaps (was the "update_text" spine event)
	//   0.467  text fades back in
	//   0.633  text has scaled to 1.4x
	//   0.800  starts settling
	//   0.900  explosion gone
	//   1.200  animation ends -> oncomplete   (was the "complete" listener)
	const DURATION = 1.2;
	const BURST_IN = 0.1333;
	const BURST_OUT = 0.9;

	const amount = new Tween(0);
	let t = $state(0);

	const normalUpdate = async () => {
		await amount.set(props.amount);
		props.oncomplete();
	};

	$effect(() => {
		if (!props.animate) {
			t = 0;
			normalUpdate();
			return;
		}
		return runTimeline((v) => (t = v), {
			duration: DURATION,
			marks: [{ at: 0.3, run: () => amount.set(props.amount) }],
			oncomplete: props.oncomplete,
		});
	});

	const burstProgress = $derived(
		props.animate ? (t - BURST_IN) / (BURST_OUT - BURST_IN) : 0,
	);

	const textAlpha = $derived(
		!props.animate ? 1 : t < 0.2 ? ramp(t, 0, 0.2, 1, 0) : ramp(t, 0.2, 0.4667, 0, 1),
	);

	const textScale = $derived(
		!props.animate
			? 1
			: t < 0.2
				? 1
				: t < 0.6333
					? rampOut(t, 0.2, 0.6333, 1, 1.4)
					: t < 0.8
						? 1.4
						: rampOut(t, 0.8, DURATION, 1.4, 1),
	);
</script>

<Burst progress={burstProgress} radius={props.width * 0.45} shards={16} embers={22} />

<Container alpha={textAlpha} scale={textScale}>
	<ResponsiveBitmapText
		anchor={0.5}
		y={-0.06 * SYMBOL_SIZE}
		style={{
			fontFamily: 'gold',
			fontSize: 0.5 * SYMBOL_SIZE,
		}}
		text={bookEventAmountToCurrencyString(amount.current)}
		maxWidth={props.width * 0.62}
	/>
</Container>
