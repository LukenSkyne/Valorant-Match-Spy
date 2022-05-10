<script lang="ts">
	import type { CompetitiveTier } from "./Typedef"
	import { fade } from "svelte/transition"

	export let highestTier: CompetitiveTier
	export let currentTier: CompetitiveTier
	//export let lowestTier: CompetitiveTier

	const colorMap = {
		"IRON": "bebebe",
		"BRONZE": "d7a263",
		"SILVER": "d9e2df",
		"GOLD": "ffd669",
		"PLATINUM": "53d3e0",
		"DIAMOND": "f57ff8",
		"IMMORTAL": "ff5877",
		"RADIANT": "fff0a0",
	}

	$: highestTierStyle = `color: #${colorMap[highestTier?.divisionName] ?? highestTier?.color ?? "fff"}`
	$: currentTierStyle = `color: #${colorMap[currentTier?.divisionName] ?? currentTier?.color ?? "fff"}`

	let showInfo = false

	function onMouseEnter() {
		showInfo = true
		console.log("onMouseEnter")
	}

	function onMouseLeave() {
		showInfo = false
		console.log("onMouseLeave")
	}
</script>

<div class="floatingRankInfo" in:fade={{duration: 200 }} on:mouseenter={onMouseEnter} on:mouseleave={onMouseLeave}>
	{#if highestTier !== null && highestTier?.tier !== currentTier?.tier}
		<div class="rankInfo">
			<span class="rankText" style={highestTierStyle}>
				{showInfo ? "Highest Rank" : highestTier.tierName}
			</span>
			<img alt src={highestTier.smallIcon} height="100%">
		</div>
	{/if}
	{#if currentTier !== null}
		<div class="rankInfo">
			<span class="rankText" style={currentTierStyle}>
				{showInfo ? "Current Rank" : currentTier.tierName}
			</span>
			<img alt src={currentTier.smallIcon} height="100%">
		</div>
	{/if}
</div>

<style>
    .floatingRankInfo {
        position: absolute;
        right: 0;
        padding: 4px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;

        /*background-color: #2227;
        border-radius: 4px 0 0 4px;
        backdrop-filter: blur(20px);*/
    }

    .rankInfo {
        position: relative;
        height: 32px;

        display: flex;
        flex-direction: row;

        align-items: center;
        justify-content: flex-end;
        gap: 4px;
    }

    .rankText {
        padding: 2px 6px;
        font-size: 13px;

        background-color: #0007;
        border-radius: 100px;
		backdrop-filter: blur(2px);
    }
</style>
