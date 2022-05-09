<script lang="ts">
	import { onMount, onDestroy } from "svelte"
	import type { Unsubscriber } from "svelte/store"
	//
	import { EventsOff, EventsOnMultiple, WindowSetTitle } from "../wailsjs/runtime"
	import { ValorantClient } from "./script/ValorantClient"
	//import { ValorantClientMock } from "./script/ValorantClientMock"
	import { SaveLog } from "../wailsjs/go/utils/Utility"
	//
	import type { RawPresence, WebSocketPayload } from "./script/Typedef"
	//
	import Menus from "./components/Menus.svelte"
	import InGame from "./components/InGame.svelte"
	//
	import { ClientState, Presences } from "./stores/Data"

	let ready: boolean
	let client: ValorantClient

	let initLoopHandle: NodeJS.Timeout = null
	let unsubscribeClientState: Unsubscriber

	async function tryInit() {
		console.debug(new Date().toLocaleTimeString(), "tryInit()")

		client = new ValorantClient()
		ready = await client.init()

		return ready
	}

	async function initLoop() {
		if (await tryInit() === false) {
			if (initLoopHandle === null) {
				initLoopHandle = setInterval(initLoop, 5000)
			}

			return
		}

		clearInterval(initLoopHandle)
		initLoopHandle = null

		await syncWithClient()
	}

	async function syncWithClient() {
		const presences = await client.getPresences()

		if (presences === null) {
			console.error("syncWithClient failed")

			return
		}

		console.debug("syncing presences")
		$Presences = presences

		const selfPresence = presences.find((presence) => presence.puuid === client.selfID)

		if (selfPresence === undefined) {
			return
		}

		console.debug("syncing client state")
		$ClientState = selfPresence.private.sessionLoopState
	}

	onMount(() => {
		//console.debug(new Date().toLocaleTimeString(), "onMount")
		initLoop()

		EventsOnMultiple("wsClose", () => {
			$ClientState = null
			initLoop()
		}, -1)

		EventsOnMultiple("wsMsg", (data) => {
			if (data === "") {
				return
			}

			const [, eventName, payload] = JSON.parse(data) as WebSocketPayload

			if (eventName === "OnJsonApiEvent_chat_v4_presences") {
				const rawPresences: RawPresence[] = payload.data["presences"]
				const newPresences = ValorantClient.processPresences(rawPresences)

				for (const newPresence of newPresences) {
					const i = $Presences.findIndex((p) => p.puuid === newPresence.puuid)

					if (i === -1) {
						$Presences.push(newPresence)
					} else if (payload.eventType === "Delete") {
						$Presences.splice(i, 1)
					} else {
						$Presences.splice(i, 1, newPresence)
					}
				}

				$Presences = $Presences // explicit update

				//console.debug("WS chat_v4_presences:", payload.eventType, newPresences)
				//console.debug("$Presences:", $Presences)

				const selfPresence = $Presences.find((presence) => presence.puuid === client.selfID)

				if (selfPresence === undefined) {
					return
				}

				const newClientState = selfPresence.private.sessionLoopState

				if ($ClientState !== newClientState && (newClientState !== "PREGAME" || $ClientState !== "INGAME")) {
					$ClientState = newClientState
					console.debug("$ClientState update through WS", $ClientState)
				}
			} else if (eventName === "OnJsonApiEvent_entitlements_v1_token") {
				console.debug("WS entitlements_v1_token:", payload)
				SaveLog("WS_" + eventName.replace("OnJsonApiEvent_", ""), JSON.stringify(payload, null, "\t"))
			} else if (eventName === "OnJsonApiEvent_chat_v6_conversations") {
				if (payload.uri === "/chat/v6/conversations/ares-pregame" && payload.eventType === "Delete" && $ClientState === "PREGAME") {
					$ClientState = "INGAME"
					console.debug("WS pregame ended -> INGAME")
				}
			} else {
				const eventShort = eventName.replace("OnJsonApiEvent_", "")

				console.debug(`WS ${eventShort}:`, payload)
				SaveLog("WS_" + eventShort, JSON.stringify(payload, null, "\t"))
			}
		}, -1)

		unsubscribeClientState = ClientState.subscribe((value) => {
			console.log("ClientState changed:", value)

			if (value !== null) {
				WindowSetTitle(`Valorant Match Spy - ${value}`)
			} else {
				WindowSetTitle("Valorant Match Spy")
			}
		})
	})

	onDestroy(() => {
		//console.debug(new Date().toLocaleTimeString(), "onDestroy")
		clearInterval(initLoopHandle)
		EventsOff("wsMsg")
		EventsOff("wsClose")
		unsubscribeClientState()
	})
</script>

<main class="container">
	{#if $ClientState === null}
		{#if ready === false}
			<span>Waiting for Valorant to Start...</span>
		{:else}
			<span>Valorant is Starting...</span>
		{/if}
	{:else}
		{#if $ClientState === "MENUS"}
			<Menus client="{client}" />
		{:else if ($ClientState === "INGAME" || $ClientState === "PREGAME")}
			<InGame client="{client}" />
		{/if}
	{/if}
</main>

<style>

</style>
