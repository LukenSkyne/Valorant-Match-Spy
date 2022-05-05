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

	let ready = false
	let client: ValorantClient = null
	let clientState: string = null

	let mainLoopHandle: NodeJS.Timeout = null

	async function tryInit() {
		console.debug(new Date().toLocaleTimeString(), "tryInit()")

		client = new ValorantClient()
		ready = await client.init()

		return ready
	}

	async function mainLoop() {
		console.debug(new Date().toLocaleTimeString(), "mainLoop()")

		if (ready === false && await tryInit() === false) {
			return
		}

		await onTickV2()
	}

	async function onTickV2() {
		console.debug(new Date().toLocaleTimeString(), "onTickV2()")

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
			ready = false
		}
	}

	onMount(() => {
		console.debug("onMount")
		mainLoopHandle = setInterval(mainLoop, 5000)
	})

	onDestroy(() => {
		console.debug("onDestroy")
		clearInterval(mainLoopHandle)
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
