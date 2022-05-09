import { ValorantClientBase } from "./ValorantClientBase"
import { GetGlz, GetLocal, GetPd, PutPd, GetShared } from "../../wailsjs/go/valorant/Client.js"
import { SaveLog } from "../../wailsjs/go/utils/Utility.js"

import type {
	Content,
	CoreGameMatch,
	PlayerData,
	PlayerMMR,
	PlayerNameInfo,
	PreGameMatch,
	Presence,
	RawPresence,
} from "./Typedef"

export class ValorantClient extends ValorantClientBase {

	static processPresences(rawPresences: RawPresence[]): Presence[] {
		const presences: Presence[] = []

		for (const rawPresence of rawPresences as RawPresence[]) {
			const hasPrivate = rawPresence.private !== null && rawPresence.product === "valorant"

			presences.push({
				...rawPresence,
				private: hasPrivate ? JSON.parse(atob(rawPresence.private)) : null,
			})
		}

		return presences
	}

	async getPresences(): Promise<Presence[]> {
		const rawPresences: RawPresence[] = JSON.parse(await GetLocal("/chat/v4/presences"))?.["presences"]

		if (rawPresences === undefined) {
			return null
		}

		return ValorantClient.processPresences(rawPresences)
	}

	async getNames(playerUUIDs: string[]): Promise<PlayerNameInfo[]> {
		return JSON.parse(await PutPd("/name-service/v2/players", JSON.stringify(playerUUIDs)))
	}

	async getMMR(playerUUID: string): Promise<PlayerMMR> {
		return JSON.parse(await GetPd(`/mmr/v1/players/${playerUUID}`))
	}

	async getContent(): Promise<Content> {
		return JSON.parse(await GetShared("/content-service/v3/content"))
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
