<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import type { Unsubscriber } from "svelte/store"
	//
	import { ValorantClient } from "../script/ValorantClient"
	//
	import { Presences } from "../stores/ClientData"

	import { GetLatestVersion, PerformSelfUpdate } from "../../wailsjs/go/valorant/Client"

	// members
	let unsubscribePresences: Unsubscriber

	function handleClick() {
		PerformSelfUpdate()
	}

	onMount(() => {
		// unsubscribePresences = Presences.subscribe((value) => {
		// 	console.log("Menus | Presences updated:", value)
		// })
	})

	onDestroy(() => {
		unsubscribePresences?.()
	})
</script>

<main class="container menuContainer">
	<span>Waiting for Match...</span>

	<div class="versionContainer">
		{#await GetLatestVersion()}
			<span>checking version...</span>
		{:then version}
			{#if version !== null}
				<span>latest version: {version}</span>
				<button on:click={handleClick}>
					Update Now
				</button>
			{:else}
				<span class="grayedOut">running the latest version</span>
			{/if}
		{:catch err}
			<span>failed to fetch version</span>
		{/await}
	</div>
</main>

<style>
	.menuContainer {
		gap: 20px;
	}

	.versionContainer {
		display: flex;
		flex-direction: column;
	}

	.grayedOut {
		opacity: 50%;
	}

	button {
        display: inline-block;
        margin-top: 4px;
        padding: 10px 10px;

        color: white;
        background-color: #f24251;

        border: none;
        text-align: center;
        text-decoration: none;
        font-size: 16px;
        cursor: pointer;

		transition: background-color 0.1s ease-in;
	}

	button:hover {
        background-color: #ff6775;
	}

    button:hover:active {
        background-color: #ff8292;
    }
</style>
