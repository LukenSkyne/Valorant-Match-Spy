<script lang="ts">
	import { ValorantClient } from "../script/ValorantClient"
	import { onMount } from "svelte"

	export let client: ValorantClient

	async function fetchData() {
		console.debug(new Date().toLocaleTimeString(), "fetchData()")

		if (client.selfID === null) {
			console.log("selfID was null")
			return
		}

		const playerData = await client.getCoreGamePlayerData(client.selfID)
		console.log("playerData:", playerData)

		if (playerData !== null) {
			const matchID = playerData["MatchID"]

			if (matchID != null) {
				const matchData = await client.getCoreGameMatch(matchID)
				console.log("matchData:", matchData)

				const loadoutData = await client.getCoreGameLoadouts(matchID)
				console.log("loadoutData:", loadoutData)
			}
		}
	}

	onMount(() => {
		console.log("client INGAME", client)
		fetchData()
	})
</script>

<main class="container">
	<span>Currently InGame</span>
	<span>SelfID: {client?.selfID}</span>
	<button class="btn" on:click={fetchData}>Fetch</button>
</main>
