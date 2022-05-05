<script lang="ts">
	import { onMount, onDestroy } from "svelte"
	//
	import { WindowSetTitle } from "../wailsjs/runtime"
	import { ValorantClient } from "./script/ValorantClient"
	//
	import Menus from "./components/Menus.svelte"
	import PreGame from "./components/PreGame.svelte"
	import InGame from "./components/InGame.svelte"
	import { SaveLog } from "../wailsjs/go/utils/Utility"

	let name: string

	let retryInitHandle: NodeJS.Timeout = null
	let onTickHandle: NodeJS.Timeout = null

	let ready = false
	let client: ValorantClient = null
	let clientState: string = null

	async function tryInit() {
		console.debug(new Date().toLocaleTimeString(), "tryInit()")
		ready = false
		client = new ValorantClient()

		if (await client.init() === false) {
			retryInitHandle = setTimeout(tryInit, 5000)
			return
		}

		ready = true
		await onTick()
		retryInitHandle = null
	}

	async function onTick() {
		console.debug(new Date().toLocaleTimeString(), "onTick()")

		const presences = await client.getPresences()

		if (presences !== null) {
			console.debug("presences:", presences)
			const selfPresence = presences.find((presence) => presence.puuid === client.selfID)

			if (selfPresence !== undefined) {
				clientState = selfPresence.private?.sessionLoopState ?? null

				/*if (clientState === "PREGAME") {
					SaveLog("local_getPresences_pregame", JSON.stringify(presences, null, "\t"))
				} else if (clientState === "INGAME") {
					SaveLog("local_getPresences_ingame", JSON.stringify(presences, null, "\t"))
				}*/

				WindowSetTitle(`Valorant Match Spy - ${clientState}`)
			}
		} else {
			console.debug("presences failed")

			clientState = null
			retryInitHandle = setTimeout(tryInit, 5000)
			return
		}

		onTickHandle = setTimeout(onTick, 5000)
	}

	onMount(() => {
		console.debug("onMount")
		tryInit()
	})

	onDestroy(() => {
		console.debug("onDestroy")

		if (retryInitHandle !== null) {
			clearTimeout(retryInitHandle)
		}

		if (onTickHandle !== null) {
			clearTimeout(onTickHandle)
		}
	})
</script>

<main>
	{#if clientState === null}
		{#if ready === false}
			<span>Waiting for Valorant to Start...</span>
		{:else}
			<span>Valorant is Starting...</span>
		{/if}
	{:else}
		{#if clientState === "MENUS"}
			<Menus client="{client}" />
		{:else if clientState === "PREGAME"}
			<PreGame client="{client}" />
		{:else if clientState === "INGAME"}
			<InGame client="{client}" />
		{/if}
	{/if}
</main>

<style>

</style>
