export type Product = "valorant" | "league_of_legends"
export type PresenceState = "away" | "dnd" | "chat" | "mobile"

export interface RawPresence {
	actor: string | null
	basic: string | null
	details: string | null
	game_name: string
	game_tag: string
	location: string | null
	msg: string | null
	name: string
	patchline: "live" | null
	pid: string
	platform: null
	private: string | null // base64 encoded JSON
	privateJwt: null
	product: Product
	puuid: string
	region: string
	resource: string
	state: PresenceState
	summary: string
	time: number
}

export interface Presence extends Omit<RawPresence, "private"> {
	private: PrivateData
}

export type CustomGameTeam = "TeamOne" | "TeamTwo" | "TeamSpectate"
export type GameMap =
	"/Game/Maps/Poveglia/Range" | // The Range
	"/Game/Maps/Triad/Triad" | // Haven
	"/Game/Maps/Bonsai/Bonsai" | // Split
	"/Game/Maps/Duality/Duality" | // Bind
	"/Game/Maps/Ascent/Ascent" | // Ascent
	"/Game/Maps/Port/Port" | // Icebox
	"/Game/Maps/Foxtrot/Foxtrot" | // Breeze
	"/Game/Maps/Canyon/Canyon" // Fracture
export type PartyAccessibility = "CLOSED" | "OPEN"
export type MatchTeam = "Red" | "Blue"
export type ProvisioningFlow = "Invalid" | "Matchmaking"
export type SessionLoopState = "MENUS" | "PREGAME" | "INGAME"
export type PartyState = "DEFAULT" | "MATCHMAKING" | "CUSTOM_GAME_SETUP"
export type QueueID = "spikerush" | "competitive" | "unrated" | "deathmatch" | "onefa" | "ggteam"

export interface PrivateData {
	accountLevel: number
	competitiveTier: number
	customGameName: string
	customGameTeam: CustomGameTeam
	isIdle: boolean
	isPartyOwner: boolean
	isValid: boolean
	leaderboardPosition: number
	matchMap: GameMap
	maxPartySize: number
	partyAccessibility: PartyAccessibility
	partyClientVersion: string // "release-04.08-shipping-15-701907"
	partyId: string // uuid
	partyLFM: boolean
	partyOwnerMatchCurrentTeam: MatchTeam
	partyOwnerMatchMap: string
	partyOwnerMatchScoreAllyTeam: number
	partyOwnerMatchScoreEnemyTeam: number
	partyOwnerProvisioningFlow: ProvisioningFlow
	partyOwnerSessionLoopState: SessionLoopState
	partySize: number
	partyState: PartyState
	partyVersion: number
	playerCardId: string // uuid
	playerTitleId: string // uuid
	preferredLevelBorderId: string
	provisioningFlow: "Invalid"
	queueEntryTime: string // "2022.05.03-23.08.47"
	queueId: QueueID
	rosterId: string
	sessionLoopState: SessionLoopState
	tournamentId: string
}
