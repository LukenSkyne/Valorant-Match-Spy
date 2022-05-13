<script lang="ts">
	import { onMount } from "svelte"
	//
	import { GetLatestVersion, PerformSelfUpdate } from "../../wailsjs/go/valorant/Client.js"

	let latestVersion: string = null

	function onButtonUpdateNow() {
		PerformSelfUpdate()
	}

	onMount(async () => {
		latestVersion = await GetLatestVersion()
	})
</script>

<main class="versionContainer">
	{#if latestVersion !== null}
		<span>latest version: {latestVersion}</span>
		<button on:click={onButtonUpdateNow}>
			Update Now
		</button>
	{:else}
		<span class="grayedOut">running the latest version</span>
	{/if}
</main>

<style>
    .versionContainer {
        display: flex;
        flex-direction: column;

		gap: 4px;
    }

    .grayedOut {
        opacity: 50%;
    }

    button {
        display: inline-block;
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
