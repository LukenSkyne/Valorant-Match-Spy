<script lang="ts">
	import { onMount, onDestroy } from "svelte"
	//
	import { WindowSetTitle } from "../wailsjs/runtime"
	import { ValorantClient } from "./script/ValorantClient"
	//import { SaveLog } from "../wailsjs/go/utils/Utility"
	//
	import Menus from "./components/Menus.svelte"
	import PreGame from "./components/PreGame.svelte"
	import InGame from "./components/InGame.svelte"

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
		if (ready === false && await tryInit() === false) {
			return
		}

		await onTick()
	}

	async function onTick() {
		console.debug(new Date().toLocaleTimeString(), "onTick()")

		const presences = await client.getPresences()

		if (presences !== null) {
			const selfPresence = presences.find((presence) => presence.puuid === client.selfID)

			if (selfPresence !== undefined) {
				clientState = selfPresence.private?.sessionLoopState ?? null
				WindowSetTitle(`Valorant Match Spy - ${clientState}`)
			}

			//const nameData = await client.getNames(presences.map((p) => p.puuid))
			//console.log("nameData", nameData)
		} else {
			console.debug(new Date().toLocaleTimeString(), "presences failed")

			clientState = null
			ready = false
		}
	}

	onMount(() => {
		//console.debug(new Date().toLocaleTimeString(), "onMount")
		mainLoop()
		mainLoopHandle = setInterval(mainLoop, 5000)
	})

	onDestroy(() => {
		//console.debug(new Date().toLocaleTimeString(), "onDestroy")
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
