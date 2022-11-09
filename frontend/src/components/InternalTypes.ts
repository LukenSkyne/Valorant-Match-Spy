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

export interface SeasonMap {
	[uuid: string]: Season
}

export interface Season {
	uuid: string;
	displayName: string;
	type: string;
	startTime: Date;
	endTime: Date;
	parentUuid: string;
	assetPath: string;
}

export interface CompetitiveSeasonMap {
	[uuid: string]: CompetitiveSeason
}

export interface CompetitiveTierInfoMap {
	[uuid: string]: CompetitiveTierInfo
}

export interface CompetitiveSeason {
	uuid: string // "8d9e3688-470b-c0e0-5b20-ca964d907adb"
	startTime: string // "2020-04-06T16:00:00Z"
	endTime: string // "2020-05-29T06:59:00Z"
	seasonUuid: string // "0df5adb9-4dcb-6899-1306-3e9860661dd3"
	competitiveTiersUuid: string // "564d8e28-c226-3180-6285-e48a390db8b1"
	borders: object[]
}

export interface CompetitiveTierInfo {
	uuid: string // "564d8e28-c226-3180-6285-e48a390db8b1"
	assetObjectName: string
	tiers: CompetitiveTier[]
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

export interface Buddy {
	uuid: string // "dce731f8-4560-5f30-6eb5-8ab2e36864ec"
	displayName: string // "RGX 11z Pro Buddy"
	isHiddenIfNotOwned: false
	themeUuid: null
	displayIcon: string // "https://media.valorant-api.com/buddies/dce731f8-4560-5f30-6eb5-8ab2e36864ec/displayicon.png"
	assetPath: string // "ShooterGame/Content/Equippables/Buddies/Afterglow/GunBuddy_Afterglow_PrimaryAsset"
	levels: [
		/*{
			"uuid": "a3043ec2-4a5b-ca46-d8f6-0399f1e52565",
			"charmLevel": 1,
			"displayName": "Afterglow",
			"displayIcon": "https://media.valorant-api.com/buddylevels/a3043ec2-4a5b-ca46-d8f6-0399f1e52565/displayicon.png",
			"assetPath": "ShooterGame/Content/Equippables/Buddies/Afterglow/GunBuddy_Afterglow_Lv1_PrimaryAsset"
		}*/
	]
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
