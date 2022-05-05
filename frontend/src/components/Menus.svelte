<script lang="ts">
	import { ValorantClient } from "../script/ValorantClient"
	import { onMount } from "svelte"

	export let client: ValorantClient

	onMount(() => {
		console.log("client", client)
	})
</script>

<main class="container">
	<span>In MENUS</span>
	<span>SelfID: {client?.selfID}</span>
</main>
