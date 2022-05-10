import { ValorantClient as ValorantClientReal } from "./ValorantClient"
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

export class ValorantClient {
	static processPresences(rawPresences: RawPresence[]): Presence[] {
		return ValorantClientReal.processPresences(rawPresences)
	}

	static async getPresences(): Promise<Presence[]> {
		return [{
			actor: "",
			basic: "",
			details: "",
			game_name: "Luken",
			game_tag: "1337",
			location: null,
			msg: null,
			name: "LukenSkyne",
			patchline: null,
			pid: "",
			platform: null,
			private: {
				accountLevel: 144,
				competitiveTier: 3,
				customGameName: "",
				customGameTeam: "TeamOne",
				isIdle: false,
				isPartyOwner: false,
				isValid: true,
				leaderboardPosition: 0,
				matchMap: "/Game/Maps/Ascent/Ascent",
				maxPartySize: 5,
				partyAccessibility: "CLOSED",
				partyClientVersion: "release-04.08-shipping-15-701907",
				partyId: "", // uuid
				partyLFM: false,
				partyOwnerMatchCurrentTeam: "Red",
				partyOwnerMatchMap: "",
				partyOwnerMatchScoreAllyTeam: 6,
				partyOwnerMatchScoreEnemyTeam: 3,
				partyOwnerProvisioningFlow: "Invalid",
				partyOwnerSessionLoopState: "MENUS",
				partySize: 5,
				partyState: "DEFAULT",
				partyVersion: 13337,
				playerCardId: "string", // uuid
				playerTitleId: "string", // uuid
				preferredLevelBorderId: "string",
				provisioningFlow: "Invalid",
				queueEntryTime: "2022.05.03-23.08.47", // "2022.05.03-23.08.47"
				queueId: "competitive",
				rosterId: "string",
				sessionLoopState: "INGAME",
				tournamentId: "string",
			},
			privateJwt: null,
			product: "valorant",
			puuid: "da85bcae-8416-54f6-a264-78454da9b9ef",
			region: "eu1",
			resource: "string",
			state: "away",
			summary: "summary",
			time: 13337,
		}]
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
		const imp = (await import(`./mockData/pd_getMMR_${playerUUID}.json`)).default

		return imp as unknown as PlayerMMR
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

	static async getPreGameLoadouts(matchUUID: string) {
		//const loadoutData = JSON.parse(await GetGlz(`/pregame/v1/matches/${matchUUID}/loadouts`))
		//return loadoutData
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

	static async getCoreGameLoadouts(matchUUID: string) {
		//const loadoutData = JSON.parse(await GetGlz(`/core-game/v1/matches/${matchUUID}/loadouts`))
		//return loadoutData
	}
}
