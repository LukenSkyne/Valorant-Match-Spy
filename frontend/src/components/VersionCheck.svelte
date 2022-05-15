<script lang="ts">
	import { onMount } from "svelte"
	//
	import { GetLatestVersion, PerformSelfUpdate } from "../../wailsjs/go/valorant/Client.js"
	import { UpdateComplete } from "../stores/VersionData"
	//
	import Dialog from "./ui/Dialog.svelte"
	import Button from "./ui/Button.svelte"

	let latestVersion: string = null
	let showUpdateCompleteDialog = false
	let updateInProgress = false

	async function onButtonUpdateNow() {
		updateInProgress = true
		$UpdateComplete = await PerformSelfUpdate()
		updateInProgress = false

		showUpdateCompleteDialog = $UpdateComplete
	}

	onMount(async () => {
		latestVersion = await GetLatestVersion()
	})
</script>

<main class="versionContainer">
	{#if $UpdateComplete === false}
		{#if latestVersion !== null}
			<span>latest version: v{latestVersion}</span>
			<Button text="Update Now" type={updateInProgress ? "disabled" : "error" } callback={updateInProgress ? () => {} : onButtonUpdateNow} />
		{:else}
			<span class="grayedOut">running the latest version</span>
		{/if}
	{:else}
		<span class="grayedOut">please restart to switch to the latest version</span>
	{/if}
	<Dialog bind:show={showUpdateCompleteDialog} />
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
