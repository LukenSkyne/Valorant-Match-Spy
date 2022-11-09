<script lang="ts">
	import { fade, fly } from "svelte/transition"
	//
	import type { CompetitiveTier } from "./InternalTypes"

	export let highestTier: CompetitiveTier
	export let currentTier: CompetitiveTier
	export let lowestTier: CompetitiveTier

	const colorMap = {
		"IRON": "bebebe",
		"BRONZE": "d7a263",
		"SILVER": "d9e2df",
		"GOLD": "ffd669",
		"PLATINUM": "53d3e0",
		"DIAMOND": "f57ff8",
		"ASCENDANT": "6ae2af",
		"IMMORTAL": "ff5877",
		"RADIANT": "fff0a0",
	}

	let showInfo = false
	let introState = false
	let outroState = false

	$: highestTierStyle = `color: #${colorMap[highestTier?.divisionName] ?? highestTier?.color ?? "fff"}`
	$: currentTierStyle = `color: #${colorMap[currentTier?.divisionName] ?? currentTier?.color ?? "fff"}`
	$: hoverRankInfo = (showInfo === false && introState === false) || outroState === true
</script>

<div class="floatingRankInfo" in:fade={{duration: 100 }} on:mouseenter={() => showInfo = true} on:mouseleave={() => showInfo = false}>
	{#if highestTier !== null && highestTier?.tier !== currentTier?.tier}
		<div class="rankInfo">
			{#if hoverRankInfo}
				<span transition:fly={{ y: 16, duration: 200 }} class="rankText" style={highestTierStyle}
				>
					{highestTier.tierName}
				</span>
			{:else}
				<span transition:fly={{ y: -16, duration: 200 }} class="rankText" style={highestTierStyle}
				>
					{highestTier.displaySeason}
				</span>
			{/if}
			<img alt src={highestTier.smallIcon} height="100%">
		</div>
	{/if}
	{#if currentTier !== null}
		<div class="rankInfo">
			{#if hoverRankInfo}
				<span transition:fly={{ y: 16, duration: 200 }} class="rankText" style={currentTierStyle}>
					{currentTier.tierName}
				</span>
			{:else}
				<span transition:fly={{ y: -16, duration: 200 }} class="rankText" style={currentTierStyle}
					  on:introstart={() => introState = true}
					  on:introend={() => introState = false}
					  on:outrostart={() => outroState = true}
					  on:outroend={() => outroState = false}
				>
					Current Rank
				</span>
			{/if}

			<img alt src={currentTier.smallIcon} height="100%">
		</div>
	{/if}
</div>

<style>
    .floatingRankInfo {
		width: 30%;
        height: 100%;

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
		user-select: none;

        align-items: center;
        justify-content: flex-end;
        gap: 4px;
    }

	.rankText {
		position: absolute;
		right: 36px;

        padding: 2px 6px;
        font-size: 13px;
        white-space: nowrap;

        pointer-events: none;
        border-radius: 100px;
        background-color: #0007;
        backdrop-filter: blur(2px);
	}
</style>
