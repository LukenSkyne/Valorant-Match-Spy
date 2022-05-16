import type { MatchTeam, PlayerIdentity, PlayerNameInfo, SeasonalBadgeInfo } from "../script/Typedef"

export interface Player {
	Subject: string // uuid
	TeamID: MatchTeam
	CharacterID: string | null
	PartyColor: string | null
	PlayerIdentity: PlayerIdentity
	SeasonalBadgeInfo: SeasonalBadgeInfo
	NameInfo: PlayerNameInfo
	HighestTier: CompetitiveTier | null
	CurrentTier: CompetitiveTier | null
	LowestTier: CompetitiveTier | null
	CurrentRankedRating: number | null
	Loadout: PlayerSkin[]
}

export interface PlayerSkin {
	skin: Skin
	skinChromaID: string
	buddyID: string
}


// interfaces for https://valorant-api.com/ endpoints

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

export interface Skin {
	uuid: string // "97af88e4-4176-9fa3-4a26-57919443dab7"
	displayName: string // "Glitchpop Odin"
	themeUuid: string // "5b014f36-414b-4703-9c65-1876c630feaa"
	contentTierUuid: string // "e046854e-406c-37f4-6607-19a9ba8426fc"
	displayIcon: string // "https://media.valorant-api.com/weaponskins/97af88e4-4176-9fa3-4a26-57919443dab7/displayicon.png"
	wallpaper: null
	assetPath: string // "ShooterGame/Content/Equippables/Guns/HvyMachineGuns/HMG/Cyberpunk/HeavyMachineGun_Cyberpunk_PrimaryAsset"
	chromas: SkinChroma[]
}

export interface SkinChroma {
	uuid: string
	displayName: string // "Glitchpop Odin Level 5\r\n(Variant 1 Blue)"
	displayIcon: string // "https://media.valorant-api.com/weaponskinchromas/0b30b3e8-4696-7b7c-fed2-50b34234965a/displayicon.png"
	fullRender: string // "https://media.valorant-api.com/weaponskinchromas/0b30b3e8-4696-7b7c-fed2-50b34234965a/fullrender.png"
	swatch: string // "https://media.valorant-api.com/weaponskinchromas/0b30b3e8-4696-7b7c-fed2-50b34234965a/swatch.png"
	streamedVideo: null
	assetPath: string // "ShooterGame/Content/Equippables/Guns/HvyMachineGuns/HMG/Cyberpunk/Chromas/Blue/HeavyMachineGun_Cyberpunk_Blue_PrimaryAsset"
}
