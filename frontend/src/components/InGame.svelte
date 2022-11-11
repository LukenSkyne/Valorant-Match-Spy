<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import { fade } from "svelte/transition"
	import type { Unsubscriber } from "svelte/store"
	//
	import { ValorantClient } from "../script/ValorantClient"
	import type { CoreGameMatch, MatchTeam, PlayerLoadout, PreGameMatch, SessionLoopState } from "../script/Typedef"
	import type { Player, PlayerSkin } from "./InternalTypes"
	import { compareCompetitiveTier } from "../script/Utils"
	//
	import { ClientID, ClientState, Presences, HoldState } from "../stores/ClientData"
	import {
		AllBuddies,
		AllCompetitiveSeasons,
		AllCompetitiveTierInfo,
		AllSeasons,
		AllSkins,
		CurrentSeasonID,
	} from "../stores/ValorantAPI"
	//
	import PlayerInfo from "./PlayerInfo.svelte"
	import DecorationTop from "../assets/images/DecorationTop.svelte"
	import DecorationBot from "../assets/images/DecorationBot.svelte"

	// members
	let unsubscribeClientState: Unsubscriber
	let unsubscribePresences: Unsubscriber
	let preGameMatchData: PreGameMatch
	let coreGameMatchData: CoreGameMatch
	let clientTeamID: MatchTeam
	let players: Player[] = []
	let backgroundUrl: string = null

	$: allies = players.filter((p) => p.TeamID === clientTeamID)
	$: enemies = players.filter((p) => p.TeamID !== clientTeamID)
	$: gameContainerStyle = `--background-url: url(${backgroundUrl})`

	function assignPartyColors() {
		const colorPalette = [
			"#7ADFBC",
			"#6FC8FF",
			"#B36EDC",
			"#FF6F91",
			"#FF9671",
			"#FFC75F",
			"#9ef971",
		]
		let colorIndex = 0
		const parties = {}

		for (const player of players) {
			const presence = $Presences.find((p) => p.puuid === player.Subject)

			if (presence === undefined ||
				presence.private === null ||
				presence.private.partyId === null ||
				presence.private.partyId === "" ||
				presence.private.partySize < 2) {
				player.PartyColor = null
				continue
			}

			const partyID = presence.private.partyId
			parties[partyID] ??= colorPalette[colorIndex++]

			if (player.PartyColor !== parties[partyID]) {
				player.PartyColor = parties[partyID]
				players = players // explicit update
			}
		}
	}

	function processLoadouts(loadouts: PlayerLoadout[]) {
		const typeToSocketID = {
			skinID: "bcef87d6-209b-46c6-8b19-fbe40bd95abc",
			//skinLevel: "e7c63390-eda7-46e0-bb7a-a6abdacd2433",
			skinChromaID: "3ad1b2b2-acdb-4524-852f-954a76ddae0a",
			buddyID: "77258665-71d1-4623-bc72-44db9bd5b3b3",
		}

		const weapons = {
			"29a0cfab-485b-f5d5-779a-b59f85e204a8": "classic",
			"42da8ccc-40d5-affc-beec-15aa47b42eda": "shorty",
			"44d4e95c-4157-0037-81b2-17841bf2e8e3": "frenzy",
			"1baa85b4-4c70-1284-64bb-6481dfc3bb4e": "ghost",
			"e336c6b8-418d-9340-d77f-7a9e4cfe0702": "sheriff",

			"f7e1b454-4ad4-1063-ec0a-159e56b58941": "stinger",
			"462080d1-4035-2937-7c09-27aa2a5c27a7": "spectre",
			"910be174-449b-c412-ab22-d0873436b21b": "bucky",
			"ec845bf4-4f79-ddda-a3da-0db3774b2794": "judge",

			"ae3de142-4d85-2547-dd26-4e90bed35cf7": "bulldog",
			"4ade7faa-4cf1-8376-95ef-39884480959b": "guardian",
			"ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a": "phantom",
			"9c82e19d-4575-0200-1a81-3eacf00cf872": "vandal",

			"c4883e50-4494-202c-3ec3-6b8a9284f00b": "marshal",
			"a03b24d3-4319-996d-0f8c-94bbfba1dfc7": "operator",
			"55d8a0f4-4274-ca67-fe2c-06ab45efdf58": "ares",
			"63e6c2b6-4a8e-869c-3d4c-e38355226584": "odin",
			"2f59173c-4bed-b6c3-2191-dea9b58be9c7": "melee",
		}

		const playerLoadouts = loadouts.map((playerLoadout) => {
			const playerSkins: PlayerSkin[] = []

			for (const weaponID of Object.keys(weapons)) {
				const item = playerLoadout.Items[weaponID]

				if (item === undefined) {
					console.error("processLoadouts | Item not found:", weapons[weaponID], playerLoadout)
					continue
				}

				const skinID = item.Sockets[typeToSocketID.skinID]?.Item.ID
				const skinChromaID = item.Sockets[typeToSocketID.skinChromaID]?.Item.ID
				const buddyID = item.Sockets[typeToSocketID.buddyID]?.Item.ID

				playerSkins.push({
					skin: $AllSkins.find((skin) => skin.uuid === skinID),
					skinChromaID,
					buddyID,
				})
			}

			return playerSkins
		})

		for (let i = 0; i < players.length; i++) {
			players[i].Loadout = playerLoadouts[i]
		}

		players = players // explicit update
	}

	async function updateBackground(mapID) {
		if (backgroundUrl !== null) {
			return
		}

		const mapsResponse = await fetch("https://valorant-api.com/v1/maps")
		const mapsJson = await mapsResponse.json()
		const currentMap = mapsJson["data"].find((mapObj) => mapObj["mapUrl"] === mapID)

		backgroundUrl = currentMap["splash"] ?? null
	}

	function capitalizeFirstChar(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
	}

	async function fetchRanks() {
		const seasonIndexLookup = Object.keys($AllCompetitiveSeasons)

		for (const player of players) {
			if (player.CurrentTier !== null) {
				continue
			}

			await new Promise(resolve => setTimeout(resolve, 100))
			const playerMMR = await ValorantClient.getMMR(player.Subject)

			if (playerMMR === null) {
				console.error("PLAYER MMR REQUEST FAILED")
				break
			}

			const seasonalInfoMap = playerMMR.QueueSkills?.competitive?.SeasonalInfoBySeasonID ?? {}
			const currentSeasonStats = seasonalInfoMap?.[$CurrentSeasonID]
			const currentCompSeason = $AllCompetitiveSeasons[$CurrentSeasonID] ?? null
			const currentCompTiers = $AllCompetitiveTierInfo[currentCompSeason.competitiveTiersUuid]?.tiers ?? null
			//
			const rankNow = currentSeasonStats?.CompetitiveTier ?? 0
			const rrNow = currentSeasonStats?.RankedRating ?? 0

			const achievedRanks = []
			const seasonalInfoArr = Object.values(seasonalInfoMap).sort((a, b) => {
				return seasonIndexLookup.indexOf(a.SeasonID) - seasonIndexLookup.indexOf(b.SeasonID)
			})

			for (const seasonalInfo of seasonalInfoArr) {
				const compSeason = $AllCompetitiveSeasons[seasonalInfo.SeasonID] ?? null
				const compTiers = $AllCompetitiveTierInfo[compSeason.competitiveTiersUuid]?.tiers ?? null

				const act = $AllSeasons[seasonalInfo.SeasonID]
				const episode = $AllSeasons[act.parentUuid]
				const displayAct = capitalizeFirstChar(act?.displayName ?? "")
				const displayEpisode = capitalizeFirstChar(episode?.displayName ?? "")
				const displaySeason = episode !== undefined ? `${displayEpisode} / ${displayAct}` : displayAct

				for (const tier of Object.keys(seasonalInfo.WinsByTier ?? {})) {
					if (tier > 2) {
						const tierInfo = structuredClone(compTiers.find((ct) => ct.tier === Number(tier)))
						tierInfo.displaySeason = displaySeason

						achievedRanks.push(tierInfo)
					}
				}
			}

			// sort ranks in reverse order
			achievedRanks.sort((a, b) => compareCompetitiveTier(b, a))

			player.HighestTier = achievedRanks.at(0) ?? null
			player.CurrentTier = currentCompTiers[rankNow]
			player.LowestTier = achievedRanks.at(-1) ?? null
			player.CurrentRankedRating = rrNow

			players = players // explicit update
		}
	}

	async function fetchMatch(clientState: SessionLoopState | null) {
		if (clientState === "PREGAME") {
			$HoldState = false

			const playerData = await ValorantClient.getPreGamePlayerData($ClientID)
			preGameMatchData = await ValorantClient.getPreGameMatch(playerData.MatchID)
			const playerNames = await ValorantClient.getNames(preGameMatchData.AllyTeam.Players.map((player) => player.Subject))

			updateBackground(preGameMatchData.MapID).catch(console.error)
			clientTeamID = preGameMatchData.AllyTeam.TeamID

			players = preGameMatchData.AllyTeam.Players.map((ally) => ({
				Subject: ally.Subject,
				TeamID: clientTeamID,
				NameInfo: playerNames.find((playerName) => playerName.Subject === ally.Subject),
				PlayerIdentity: ally.PlayerIdentity,
				SeasonalBadgeInfo: ally.SeasonalBadgeInfo,
				CharacterID: null,
				HighestTier: null,
				CurrentTier: null,
				LowestTier: null,
				CurrentRankedRating: null,
				PartyColor: null,
				Loadout: null,
			}))

			assignPartyColors()
			await fetchRanks()

			//await ValorantClient.getPreGameLoadouts(playerData.MatchID)

			console.log("preGameMatchData.Mode", preGameMatchData.Mode)
		} else if (clientState === "INGAME") {
			const playerData = await ValorantClient.getCoreGamePlayerData($ClientID)
			coreGameMatchData = await ValorantClient.getCoreGameMatch(playerData.MatchID)
			const playerNames = await ValorantClient.getNames(coreGameMatchData.Players.map((player) => player.Subject))

			updateBackground(coreGameMatchData.MapID).catch(console.error)
			clientTeamID = coreGameMatchData.Players.find((player) => player.Subject === $ClientID)?.TeamID

			players = coreGameMatchData.Players.map(player => ({
				Subject: player.Subject,
				TeamID: player.TeamID,
				NameInfo: playerNames.find((playerName) => playerName.Subject === player.Subject),
				PlayerIdentity: player.PlayerIdentity,
				SeasonalBadgeInfo: player.SeasonalBadgeInfo,
				CharacterID: player.CharacterID,
				HighestTier: null,
				CurrentTier: null,
				LowestTier: null,
				CurrentRankedRating: null,
				PartyColor: null,
				Loadout: null,
			}))

			const coreGameLoadouts = await ValorantClient.getCoreGameLoadouts(playerData.MatchID)

			if (coreGameLoadouts !== null) {
				processLoadouts(coreGameLoadouts.map((c) => c.Loadout))
			}

			assignPartyColors()
			await fetchRanks()

			$HoldState = true

			console.log("coreGameMatchData.ModeID", coreGameMatchData.ModeID)
		}
	}

	onMount(async () => {
		if ($AllSeasons === null) {
			const seasonsJson = await (await fetch("https://valorant-api.com/v1/seasons")).json()
			const seasons = seasonsJson?.data
			$AllSeasons = Object.assign({}, ...seasons.map((x) => ({[x.uuid]: x})))
		}

		if ($AllCompetitiveSeasons === null) {
			const compSeasonsJson = await (await fetch("https://valorant-api.com/v1/seasons/competitive")).json()
			const compSeasons = compSeasonsJson?.data
			$AllCompetitiveSeasons = Object.assign({}, ...compSeasons.map((x) => ({[x.seasonUuid]: x})))
		}

		if ($AllCompetitiveTierInfo === null) {
			const compTiersJson = await (await fetch("https://valorant-api.com/v1/competitivetiers")).json()
			const compTiers = compTiersJson?.data
			$AllCompetitiveTierInfo = Object.assign({}, ...compTiers.map((x) => ({[x.uuid]: x})))

			const divisionOrder = [
				"UNRANKED",
				"IRON",
				"BRONZE",
				"SILVER",
				"GOLD",
				"PLATINUM",
				"DIAMOND",
				"ASCENDANT",
				"IMMORTAL",
				"RADIANT",
			]

			for (const season of Object.values($AllCompetitiveTierInfo)) {
				for (const t of season.tiers) {
					t.tierName = capitalizeFirstChar(t.tierName)
					t.divisionIndex = divisionOrder.indexOf(t.divisionName)
					t.divisionTier = Number(t.tierName.split(" ")[1]) || 3
				}
			}
		}

		if ($AllSkins === null) {
			const skinsJson = await (await fetch("https://valorant-api.com/v1/weapons/skins")).json()
			$AllSkins = skinsJson?.data
		}

		if ($AllBuddies === null) {
			const buddiesJson = await (await fetch("https://valorant-api.com/v1/buddies")).json()
			$AllBuddies = buddiesJson?.data
		}

		if ($CurrentSeasonID === null) {
			const content = await ValorantClient.getContent()
			const currentSeason = content.Seasons.find((season) => season.IsActive && season.Type === "act")
			$CurrentSeasonID = currentSeason.ID ?? null
		}

		unsubscribeClientState = ClientState.subscribe((clientState) => {
			fetchMatch(clientState)
		})

		unsubscribePresences = Presences.subscribe(() => {
			assignPartyColors()
		})
	})

	onDestroy(() => {
		unsubscribeClientState?.()
		unsubscribePresences?.()
	})
</script>

<main transition:fade={{ duration: 200 }} class="gameContainer" style={gameContainerStyle}>
	<!-- ALLIES -->
	{#if allies.length > 0}
		<div class="teamContainer">
			<span class="teamTitle" data-team="blue" class:ocd={$ClientState === "PREGAME"}>
				{$ClientState === "PREGAME" ?
					"A G E N T   S E L E C T I O N   P H A S E" :
					"A L L I E S"}
			</span>

			<DecorationTop />
			{#each allies as ally}
				<PlayerInfo player={ally} team="blue"/>
			{/each}
			<DecorationBot />
		</div>
	{/if}

	<!-- ENEMIES -->
	{#if enemies.length > 0}
		<div class="teamContainer">
			<span class="teamTitle" data-team="red">E N E M I E S</span>

			<DecorationTop />
			{#each enemies as enemy}
				<PlayerInfo player={enemy} team="red"/>
			{/each}
			<DecorationBot />
		</div>
	{/if}
</main>

<style>
    :root {
        /*
		--blue: 169deg 66% 61%;
		--red: 353deg 86% 69%;
		*/

        --blue: 169deg 66% 61%;
        --blue-dark: 169deg 40% 50%;
        --blue-darker: 169deg 50% 20%;

        --red: 353deg 86% 69%;
        --red-dark: 353deg 40% 50%;
        --red-darker: 353deg 40% 30%;

		--yellow-dark: 48deg 87% 83%;
		--yellow-darker: 49deg 28% 63%;

        --white: 0deg 100% 100%;
    }

    .ocd {
        margin-left: 1px;
    }

    .gameContainer {
        z-index: 100;
		position: absolute;
        left: 0;
		top: 0;

        width: 100%;
        height: 100%;
        color: white;
        overflow: hidden;

        display: flex;
        justify-content: center;
        align-items: center;
        gap: 50px;

        --background-url: ""; /* custom property */
        background: rgba(0, 0, 0, 0.75) var(--background-url);
        background-size: cover;
        background-position: center;
        background-blend-mode: darken;
    }

    .teamContainer {
        width: 434px;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 9px;
    }

    .teamTitle {
        color: hsl(var(--blue));
    }

    .teamTitle[data-team="blue"] {
        color: hsl(var(--blue));
    }

    .teamTitle[data-team="red"] {
        color: hsl(var(--red));
    }
</style>
