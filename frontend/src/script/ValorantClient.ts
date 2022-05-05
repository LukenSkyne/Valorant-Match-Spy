import { ValorantClientBase } from "./ValorantClientBase"
import { GetLocal, GetGlz, PutPd } from "../../wailsjs/go/valorant/Client.js"
import { SaveLog } from "../../wailsjs/go/utils/Utility.js"

import type { Presence, RawPresence, PlayerData, CoreGameMatch, PreGameMatch, PlayerName } from "./Typedef"

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

	async getNames(playerUUIDs: string[]): Promise<PlayerName[]> {
		return JSON.parse(await PutPd("/name-service/v2/players", JSON.stringify(playerUUIDs)))
	}

	/* PreGame */

	async getPreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return JSON.parse(await GetGlz(`/pregame/v1/players/${playerUUID}`))
	}

	async getPreGameMatch(matchUUID: string): Promise<PreGameMatch> {
		const matchData = JSON.parse(await GetGlz(`/pregame/v1/matches/${matchUUID}`))

		SaveLog("glz_getPreGameMatch", JSON.stringify(matchData, null, "\t"))

		return matchData
	}

	async getPreGameLoadouts(matchUUID: string) {
		const loadoutData = JSON.parse(await GetGlz(`/pregame/v1/matches/${matchUUID}/loadouts`))

		SaveLog("glz_getPreGameLoadouts", JSON.stringify(loadoutData, null, "\t"))

		return loadoutData
	}

	/* CoreGame */

	async getCoreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return JSON.parse(await GetGlz(`/core-game/v1/players/${playerUUID}`))
	}

	async getCoreGameMatch(matchUUID: string): Promise<CoreGameMatch> {
		const matchData = JSON.parse(await GetGlz(`/core-game/v1/matches/${matchUUID}`))

		SaveLog("glz_getCoreGameMatch", JSON.stringify(matchData, null, "\t"))

		return matchData
	}

	async getCoreGameLoadouts(matchUUID: string) {
		const loadoutData = JSON.parse(await GetGlz(`/core-game/v1/matches/${matchUUID}/loadouts`))

		SaveLog("glz_getCoreGameLoadouts", JSON.stringify(loadoutData, null, "\t"))

		return loadoutData
	}
}
