import { ValorantClientBase } from "./ValorantClientBase"
import { GetGlz, GetLocal } from "../../wailsjs/go/valorant/Client.js"
import { SaveLog } from "../../wailsjs/go/utils/Utility.js"

import type { Presence, RawPresence, PlayerData, CoreGameMatch, PreGameMatch } from "./Typedef"

export class ValorantClient extends ValorantClientBase {

	async getPresences(): Promise<Presence[]> {
		const rawPresences: RawPresence[] | Presence[] = JSON.parse(await GetLocal("/chat/v4/presences"))?.["presences"]

		if (rawPresences === undefined) {
			return null
		}

		for (const presence of rawPresences as RawPresence[]) {
			if (presence.private === null || presence.product !== "valorant") {
				continue
			}

			try {
				presence.private = JSON.parse(atob(presence.private))
			} catch (e) {
				console.error("Decoding presence failed: ", presence.private)
			}
		}

		return rawPresences as Presence[]
	}

	async getPreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return JSON.parse(await GetGlz(`/pregame/v1/players/${playerUUID}`))
	}

	async getPreGameMatch(matchUUID: string): Promise<PreGameMatch> {
		const matchData = JSON.parse(await GetGlz(`/pregame/v1/matches/${matchUUID}`))

		SaveLog("glz_getPreGameMatch", JSON.stringify(matchData, null, "\t"))

		return matchData
	}

	async getCoreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return JSON.parse(await GetGlz(`/core-game/v1/players/${playerUUID}`))
	}

	async getCoreGameMatch(matchUUID: string): Promise<CoreGameMatch> {
		const matchData = JSON.parse(await GetGlz(`/core-game/v1/matches/${matchUUID}`))

		SaveLog("glz_getCoreGameMatch", JSON.stringify(matchData, null, "\t"))

		return matchData
	}
}
