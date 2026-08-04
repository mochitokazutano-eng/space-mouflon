<script lang="ts">
	import type { GameRuleData } from 'state-shared';

	type Props = {
		list: GameRuleData[];
	};

	const props: Props = $props();
</script>

{#each props.list ?? [] as section}
	<section class="section">
		{#if section.title}
			<h2 class="section-title">{section.title}</h2>
		{/if}

		<div class="grid" style="--columns: {Math.max(section.columns, 1)}">
			{#each section.containers as container}
				<div
					class="container"
					class:top={container.imagePosition === 'top'}
					class:left={container.imagePosition === 'left'}
					style="grid-row: {container.row + 1}; grid-column: {container.column + 1};"
				>
					{#if container.image}
						<img class="image" src={container.image} alt={container.title} />
					{/if}
					<div class="body">
						{#if container.title}
							<h3 class="container-title">{container.title}</h3>
						{/if}
						{#if container.text}
							<p class="text">{container.text}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
{/each}

<style lang="scss">
	/* Nothing up the chain (BaseContent -> BaseScrollable) has a definite width, so an auto
       width would let a long unbroken paragraph size the modal wider than the viewport. */
	.section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		width: min(60rem, 90vw);
		max-width: 100%;
	}

	.section-title {
		margin: 0;
		font-size: 1.125rem;
		letter-spacing: 0.08em;
		color: #f6c445;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
		gap: 1rem;
		width: 100%;
	}

	.container {
		display: flex;
		gap: 0.75rem;
		min-width: 0;
	}

	.container.top {
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.container.left {
		flex-direction: row;
		align-items: flex-start;
		text-align: left;
	}

	.image {
		display: block;
		object-fit: contain;
		flex-shrink: 0;
	}

	.container.top .image {
		width: 4.5rem;
		height: 4.5rem;
	}

	.container.left .image {
		width: 3.5rem;
		height: 3.5rem;
	}

	.body {
		min-width: 0;
	}

	.container-title {
		margin: 0 0 0.25rem;
		font-size: 0.875rem;
		letter-spacing: 0.04em;
	}

	.text {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.45;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-variant-numeric: tabular-nums;
	}
</style>
