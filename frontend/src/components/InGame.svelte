<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import type { Unsubscriber } from "svelte/store"
	//
	import { ValorantClient } from "../script/ValorantClient"
	import type { CoreGameMatch, MatchTeam, PreGameMatch, SessionLoopState } from "../script/Typedef"
	import type { CompetitiveTier, Player } from "./Typedef"
	//
	import { ClientID, ClientState } from "../stores/ClientData"
	//
	import PlayerInfo from "./PlayerInfo.svelte"
	import DecorationTop from "../assets/images/DecorationTop.svelte"
	import DecorationBot from "../assets/images/DecorationBot.svelte"

	// members
	let unsubscribeClientState: Unsubscriber
	let preGameMatchData: PreGameMatch
	let coreGameMatchData: CoreGameMatch
	let clientTeamID: MatchTeam
	let players: Player[] = []
	let tierList: CompetitiveTier[] = []
	let currentSeasonID: string = null
	let backgroundUrl: string = null

	$: allies = players.filter((p) => p.TeamID === clientTeamID)
	$: enemies = players.filter((p) => p.TeamID !== clientTeamID)
	$: gameContainerStyle = `--background-url: url(${backgroundUrl})`

	async function updateBackground(mapID) {
		if (backgroundUrl !== null) {
			return
		}

		const mapsResponse = await fetch("https://valorant-api.com/v1/maps")
		const mapsJson = await mapsResponse.json()
		const currentMap = mapsJson["data"].find((mapObj) => mapObj["mapUrl"] === mapID)

		backgroundUrl = currentMap["splash"] ?? null
	}

	async function fetchRanks() {
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

			const seasonalInfoMap = playerMMR.QueueSkills?.competitive?.SeasonalInfoBySeasonID
			const currentSeasonStats = seasonalInfoMap?.[currentSeasonID]
			const rankNow = currentSeasonStats?.CompetitiveTier ?? 0
			const rrNow = currentSeasonStats?.RankedRating ?? 0
			//
			const allRanksBySeason = Object.values(seasonalInfoMap).map((s) => Object.keys(s.WinsByTier ?? {}))
			const allValidRanks = [].concat(...allRanksBySeason).filter((rank) => rank > 2)
			//
			const highestRank = allValidRanks.length > 0 ? Math.max(...allValidRanks) : null
			const lowestRank = allValidRanks.length > 0 ? Math.min(...allValidRanks) : null

			player.HighestTier = tierList[highestRank] ?? null
			player.CurrentTier = tierList[rankNow]
			player.LowestTier = tierList[lowestRank] ?? null
			player.CurrentRankedRating = rrNow

			players = players // explicit update
		}
	}

	async function fetchMatch(clientState: SessionLoopState | null) {
		if (clientState === "PREGAME") {
			console.log(new Date().toLocaleTimeString(), "Fetching PreGame")

			const playerData = await ValorantClient.getPreGamePlayerData($ClientID)
			preGameMatchData = await ValorantClient.getPreGameMatch(playerData.MatchID)
			const playerNames = await ValorantClient.getNames(preGameMatchData.AllyTeam.Players.map((player) => player.Subject))

			updateBackground(preGameMatchData.MapID).catch(console.error)
			clientTeamID = preGameMatchData.AllyTeam.TeamID

			for (const ally of preGameMatchData.AllyTeam.Players) {
				players.push({
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
				})
			}

			players = players // explicit update
			await fetchRanks()
		} else if (clientState === "INGAME") {
			console.log(new Date().toLocaleTimeString(), "Fetching CoreGame")

			const playerData = await ValorantClient.getCoreGamePlayerData($ClientID)
			coreGameMatchData = await ValorantClient.getCoreGameMatch(playerData.MatchID)
			const playerNames = await ValorantClient.getNames(coreGameMatchData.Players.map((player) => player.Subject))

			updateBackground(coreGameMatchData.MapID).catch(console.error)
			clientTeamID = coreGameMatchData.Players.find((player) => player.Subject === $ClientID)?.TeamID

			for (const player of coreGameMatchData.Players) {
				const newPlayerObj: Player = {
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
				}

				const playerIndex = players.findIndex((p) => p.Subject === newPlayerObj.Subject)

				if (playerIndex !== -1) {
					players.splice(playerIndex, 1, newPlayerObj)
				} else {
					players.push(newPlayerObj)
				}
			}

			players = players // explicit update
			await fetchRanks()
		}
	}

	onMount(async () => {
		const tiersResponse = await fetch("https://valorant-api.com/v1/competitivetiers")
		const tiersJson = await tiersResponse.json()
		tierList = tiersJson?.data?.at(-1)?.["tiers"]

		tierList = tierList?.map((t) => {
			t.tierName = t.tierName.charAt(0) + t.tierName.slice(1).toLowerCase()

			return t
		})

		const content = await ValorantClient.getContent()
		const currentSeason = content.Seasons.find((season) => season.IsActive && season.Type === "act")
		currentSeasonID = currentSeason.ID

		unsubscribeClientState = ClientState.subscribe((clientState) => {
			console.debug("InGame | clientState:", clientState)
			fetchMatch(clientState)
		})
	})

	onDestroy(() => {
		unsubscribeClientState?.()
	})
</script>

<main class="gameContainer" style={gameContainerStyle}>
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
        width: 100vw;
        height: 100vh;
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
