<script lang="ts">
	import { onMount, onDestroy } from "svelte"
	//
	import { EventsOff, EventsOnMultiple } from "../wailsjs/runtime"
	import { ValorantClient } from "./script/ValorantClient"
	import type { RawPresence, WebSocketPayload } from "./script/Typedef"
	//
	import { ClientID, ClientState, Presences } from "./stores/ClientData"
	//
	import TitleBar from "./components/ui/TitleBar.svelte"
	import InGame from "./components/InGame.svelte"
	import Menus from "./components/Menus.svelte"

	async function syncWithClient() {
		const selfID = await ValorantClient.getSelfID()

		if ($ClientID !== selfID) {
			$ClientID = selfID
		}

		if (selfID === null) {
			return
		}

		const presences = await ValorantClient.getPresences()

		if (presences === null) {
			console.error("syncWithClient failed")

			return
		}

		$Presences = presences
		const selfPresence = presences.find((presence) => presence.puuid === $ClientID)

		if (selfPresence === undefined) {
			return
		}

		const state = selfPresence.private.sessionLoopState

		if ($ClientState !== state) {
			$ClientState = state
		}
	}

	onMount(() => {
		syncWithClient()

		EventsOnMultiple("state", async (state) => {
			if (state === true) {
				console.debug(new Date().toLocaleTimeString(), "ClientEvent::state READY")
				await syncWithClient()
			} else if ($ClientState !== null) {
				console.debug(new Date().toLocaleTimeString(), "ClientEvent::state no longer ready")
				$ClientState = null
			}
		}, -1)

		EventsOnMultiple("msg", (data) => {
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
				const selfPresence = $Presences.find((presence) => presence.puuid === $ClientID)

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
				//SaveLog("WS_" + eventName.replace("OnJsonApiEvent_", ""), JSON.stringify(payload, null, "\t"))
			} else if (eventName === "OnJsonApiEvent_chat_v6_conversations") {
				if (payload.uri === "/chat/v6/conversations/ares-pregame" && payload.eventType === "Delete" && $ClientState === "PREGAME") {
					$ClientState = "INGAME"
					console.debug("WS pregame ended -> INGAME")
				}
			} else {
				const eventShort = eventName.replace("OnJsonApiEvent_", "")

				console.debug(`WS ${eventShort}:`, payload)
				//SaveLog("WS_" + eventShort, JSON.stringify(payload, null, "\t"))
			}
		}, -1)
	})

	onDestroy(() => {
		EventsOff("state")
		EventsOff("msg")
	})
</script>

<TitleBar />
<div class="container">
	{#if ($ClientState === null || $ClientState === "MENUS")}
		<Menus />
	{:else if ($ClientState === "INGAME" || $ClientState === "PREGAME")}
		<InGame />
	{/if}
</div>
