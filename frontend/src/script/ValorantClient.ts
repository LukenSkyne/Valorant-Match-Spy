import { GetGlz, GetLocal, GetPd, GetShared, PutPd, SelfID } from "../../wailsjs/go/valorant/Client.js"

import type {
	Content,
	CoreGameLoadout,
	CoreGameMatch,
	PlayerData,
	PlayerLoadout,
	PlayerMMR,
	PlayerNameInfo,
	PreGameMatch,
	Presence,
	RawPresence,
} from "./Typedef"

export class ValorantClient {

	static async getSelfID() {
		return SelfID()
	}

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

	static async getPresences(): Promise<Presence[]> {
		const rawPresences: RawPresence[] = JSON.parse(await GetLocal("/chat/v4/presences"))?.["presences"]

		if (rawPresences === undefined) {
			return null
		}

		return ValorantClient.processPresences(rawPresences)
	}

	static async getNames(playerUUIDs: string[]): Promise<PlayerNameInfo[]> {
		return JSON.parse(await PutPd("/name-service/v2/players", JSON.stringify(playerUUIDs)))
	}

	static async getMMR(playerUUID: string): Promise<PlayerMMR> {
		return JSON.parse(await GetPd(`/mmr/v1/players/${playerUUID}`))
	}

	static async getContent(): Promise<Content> {
		return JSON.parse(await GetShared("/content-service/v3/content"))
	}

	/* PreGame */

	static async getPreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return JSON.parse(await GetGlz(`/pregame/v1/players/${playerUUID}`))
	}

	static async getPreGameMatch(matchUUID: string): Promise<PreGameMatch> {
		return JSON.parse(await GetGlz(`/pregame/v1/matches/${matchUUID}`))
	}

	static async getPreGameLoadouts(matchUUID: string): Promise<PlayerLoadout[]> {
		return JSON.parse(await GetGlz(`/pregame/v1/matches/${matchUUID}/loadouts`))?.["Loadouts"]
	}

	/* CoreGame */

	static async getCoreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return JSON.parse(await GetGlz(`/core-game/v1/players/${playerUUID}`))
	}

	static async getCoreGameMatch(matchUUID: string): Promise<CoreGameMatch> {
		return JSON.parse(await GetGlz(`/core-game/v1/matches/${matchUUID}`))
	}

	static async getCoreGameLoadouts(matchUUID: string): Promise<CoreGameLoadout[]> {
		return JSON.parse(await GetGlz(`/core-game/v1/matches/${matchUUID}/loadouts`))?.["Loadouts"]
	}
}
