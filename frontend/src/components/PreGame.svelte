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

		const playerData = await client.getPreGamePlayerData(client.selfID)
		console.log("playerData:", playerData)

		if (playerData !== null) {
			const matchID = playerData["MatchID"]

			if (matchID != null) {
				const matchData = await client.getPreGameMatch(matchID)
				console.log("matchData:", matchData)

				const loadoutData = await client.getPreGameLoadouts(matchID)
				console.log("loadoutData:", loadoutData)
			}
		}
	}

	onMount(() => {
		console.log("client PREGAME", client)
		fetchData()
	})
</script>

<main class="container">
	<span>PreGame / Agent Selection</span>
	<span>SelfID: {client?.selfID}</span>
	<button class="btn" on:click={fetchData}>Fetch</button>
</main>
