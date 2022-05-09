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
	tier: number
	tierName: string // "UNRANKED"
	division: string // "ECompetitiveDivision::UNRANKED"
	divisionName: string // "UNRANKED"
	color: string // "ffffffff"
	backgroundColor: string // "00000000"
	smallIcon: string
	largeIcon: string
	rankTriangleDownIcon: string | null
	rankTriangleUpIcon: string | null
}
