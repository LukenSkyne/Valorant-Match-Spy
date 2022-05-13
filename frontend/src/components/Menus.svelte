<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import type { Unsubscriber } from "svelte/store"
	//
	import { ValorantClient } from "../script/ValorantClient"
	//
	import { Presences } from "../stores/ClientData"

	// members
	let unsubscribePresences: Unsubscriber

	onMount(() => {
		// unsubscribePresences = Presences.subscribe((value) => {
		// 	console.log("Menus | Presences updated:", value)
		// })
	})

	onDestroy(() => {
		unsubscribePresences?.()
	})
</script>

<main class="container">
	<span>Waiting for Match...</span>
</main>
