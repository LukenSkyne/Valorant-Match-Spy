import { ValorantClient as ValorantClientReal } from "./ValorantClient"
import type {
	Content, CoreGameLoadout,
	CoreGameMatch,
	PlayerData, PlayerLoadout,
	PlayerMMR,
	PlayerNameInfo,
	PreGameMatch,
	Presence,
	RawPresence,
} from "./Typedef"

export class ValorantClient {

	static async getSelfID() {
		return "da85bcae-8416-54f6-a264-78454da9b9ef"
	}

	static processPresences(rawPresences: RawPresence[]): Presence[] {
		return ValorantClientReal.processPresences(rawPresences)
	}

	static async getPresences(): Promise<Presence[]> {
		const imp = (await import(`./mockData/local_getPresences.json`)).default

		return imp as Presence[]
	}

	static async getNames(playerUUIDs: string[]): Promise<PlayerNameInfo[]> {
		return Array.from(Array(10).keys()).map((index) => ({
			DisplayName: "",
			Subject: playerUUIDs[index],
			GameName: `Player${index+1}`,
			TagLine: `EUW${index+1}`,
		}))
	}

	static async getMMR(playerUUID: string): Promise<PlayerMMR> {
		return (await import(`./mockData/pd_getMMR_${playerUUID}.json`)).default
	}

	static async getContent(): Promise<Content> {
		return {
			DisabledIDs: [],
			Events: [],
			Seasons: [{
				EndTime: "2022-06-21T00:00:00Z",
				ID: "3e47230a-463c-a301-eb7d-67bb60357d4f",
				IsActive: true,
				Name: "Episode 4 - Act 3",
				StartTime: "2022-04-26T00:00:00Z",
				Type: "act",
			}]
		}
	}

	/* PreGame */

	static async getPreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return {
			Subject: playerUUID,
			MatchID: "1d5fa9b3-0dca-4be4-a2ff-0158d2111d6b",
			Version: 1652034453694,
		}
	}

	static async getPreGameMatch(matchUUID: string): Promise<PreGameMatch> {
		const imp = await import("./mockData/glz_getPreGameMatch.json")

		return imp.default as unknown as PreGameMatch
	}

	static async getPreGameLoadouts(matchUUID: string): Promise<PlayerLoadout[]> {
		return await import("./mockData/glz_getPreGameLoadouts.json")?.["Loadouts"]
	}

	/* CoreGame */

	static async getCoreGamePlayerData(playerUUID: string): Promise<PlayerData> {
		return {
			Subject: playerUUID,
			MatchID: "1d5fa9b3-0dca-4be4-a2ff-0158d2111d6b",
			Version: 1652034453694,
		}
	}

	static async getCoreGameMatch(matchUUID: string): Promise<CoreGameMatch> {
		const imp = await import("./mockData/glz_getCoreGameMatch.json")

		return imp.default as CoreGameMatch
	}

	static async getCoreGameLoadouts(matchUUID: string): Promise<CoreGameLoadout[]> {
		return (await import("./mockData/glz_getCoreGameLoadouts.json"))?.["Loadouts"]
	}
}
