import type { MatchTeam, PlayerIdentity, PlayerNameInfo, SeasonalBadgeInfo } from "../script/Typedef"

export interface Player {
	Subject: string // uuid
	TeamID: MatchTeam
	CharacterID: string | null
	PlayerIdentity: PlayerIdentity
	SeasonalBadgeInfo: SeasonalBadgeInfo
	NameInfo: PlayerNameInfo
	HighestTier: CompetitiveTier | null
	CurrentTier: CompetitiveTier | null
	LowestTier: CompetitiveTier | null
	CurrentRankedRating: number | null
}

export interface CompetitiveTier {
	tier: number // 20
	tierName: string // "DIAMOND 3"
	division: string // "ECompetitiveDivision::DIAMOND""
	divisionName: string // "DIAMOND"
	color: string // "b489c4ff"
	backgroundColor: string // "763bafff"
	smallIcon: string
	largeIcon: string
	rankTriangleDownIcon: string | null
	rankTriangleUpIcon: string | null
}
