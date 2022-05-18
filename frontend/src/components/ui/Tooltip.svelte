<script lang="ts">
	import { scale } from "svelte/transition"

	export let text: string

	let tooltipWrapper: Element
	let hover = false
	let x = 0
	let y = 0

	function onMouseOver() {
		const r = tooltipWrapper.firstElementChild.getBoundingClientRect()
		x = r.x + r.width
		y = r.y + r.height * 0.5

		hover = true
	}

	function onMouseLeave() {
		hover = false
	}
</script>

<div bind:this={tooltipWrapper} on:mouseenter={onMouseOver} on:mouseleave={onMouseLeave}>
	<slot />
	{#if hover}
		<span transition:scale={{ duration: 100 }} class="tooltip" style={`left: ${x}px; top: ${y}px`}>
			{text}
		</span>
	{/if}
</div>

<style>
	.tooltip {
		position: fixed;
		transform: translate(0%, -50%);

        border-radius: 6px;
        padding: 2px 5px;
		user-select: none;

		z-index: 1337;

		background-color: #555;
	}
</style>