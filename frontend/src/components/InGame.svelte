<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import { fade } from "svelte/transition"
	import type { Unsubscriber } from "svelte/store"
	//
	import { ValorantClient } from "../script/ValorantClient"
	import type {
		CoreGameMatch,
		MatchTeam,
		PlayerIdentity,
		PlayerNameInfo,
		PreGameMatch,
		SeasonalBadgeInfo, SessionLoopState,
	} from "../script/Typedef"
	//
	import { ClientState } from "../stores/Data"

	interface Player {
		Subject: string // uuid
		TeamID: MatchTeam
		CharacterID: string | null
		PlayerIdentity: PlayerIdentity
		SeasonalBadgeInfo: SeasonalBadgeInfo
		NameInfo: PlayerNameInfo
		CurrentTier: Tier | null
		PeakTier: Tier | null
		CurrentRankedRating: number | null
	}

	// props
	export let client: ValorantClient

	// members
	let unsubscribeClientState: Unsubscriber
	let preGameMatchData: PreGameMatch
	let coreGameMatchData: CoreGameMatch
	let clientTeamID: MatchTeam
	let players: Player[] = []


	interface Tier {
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
	let tierList: Tier[] = []
	let currentSeasonID: string = null


	async function fetchMatch(clientState: SessionLoopState | null) {
		if (clientState === "PREGAME") {
			console.log(new Date().toLocaleTimeString(), "Fetching PreGame")

			const playerData = await client.getPreGamePlayerData(client.selfID)
			preGameMatchData = await client.getPreGameMatch(playerData.MatchID)
			const playerNames = await client.getNames(preGameMatchData.AllyTeam.Players.map((player) => player.Subject))

			clientTeamID = preGameMatchData.AllyTeam.TeamID

			for (const teamMember of preGameMatchData.AllyTeam.Players) {
				players.push({
					Subject: teamMember.Subject,
					TeamID: clientTeamID,
					NameInfo: playerNames.find((playerName) => playerName.Subject === teamMember.Subject),
					PlayerIdentity: teamMember.PlayerIdentity,
					SeasonalBadgeInfo: teamMember.SeasonalBadgeInfo,
					CharacterID: null,
					CurrentTier: null,
					PeakTier: null,
					CurrentRankedRating: null,
				})
			}

			players = players // explicit update
		} else if (clientState === "INGAME") {
			console.log(new Date().toLocaleTimeString(), "Fetching CoreGame")

			const playerData = await client.getCoreGamePlayerData(client.selfID)
			coreGameMatchData = await client.getCoreGameMatch(playerData.MatchID)
			const playerNames = await client.getNames(coreGameMatchData.Players.map((player) => player.Subject))

			clientTeamID = coreGameMatchData.Players.find((player) => player.Subject === client.selfID)?.TeamID

			while (players.length) {
				players.pop()
			}

			for (const corePlayer of coreGameMatchData.Players) {
				players.push({
					Subject: corePlayer.Subject,
					TeamID: corePlayer.TeamID,
					NameInfo: playerNames.find((playerName) => playerName.Subject === corePlayer.Subject),
					PlayerIdentity: corePlayer.PlayerIdentity,
					SeasonalBadgeInfo: corePlayer.SeasonalBadgeInfo,
					CharacterID: corePlayer.CharacterID,
					CurrentTier: null,
					PeakTier: null,
					CurrentRankedRating: null,
				})
			}

			players = players // explicit update

			for (const player of players) {
				await new Promise(resolve => setTimeout(resolve, 100))
				const playerMMR = await client.getMMR(player.Subject)

				if (playerMMR === null) {
					console.error("PLAYER MMR REQUEST FAILED")
					break
				}

				const seasonalInfoMap = playerMMR.QueueSkills?.competitive?.SeasonalInfoBySeasonID
				let peakCompetitiveTier = 0

				for (const { CompetitiveTier } of Object.values(seasonalInfoMap ?? {})) {
					if (peakCompetitiveTier < CompetitiveTier) {
						peakCompetitiveTier = CompetitiveTier
					}
				}

				const currentSeasonStats = seasonalInfoMap?.[currentSeasonID]
				const rankNow = currentSeasonStats?.CompetitiveTier ?? 0
				const rrNow = currentSeasonStats?.RankedRating ?? 0

				player.CurrentTier = tierList[rankNow]
				player.PeakTier = tierList[peakCompetitiveTier]
				player.CurrentRankedRating = rrNow
				players = players // explicit update
			}
		}
	}

	onMount(async () => {
		const tiersResponse = await fetch("https://valorant-api.com/v1/competitivetiers")
		const tiersJson = await tiersResponse.json()
		tierList = tiersJson?.data?.at(-1)?.["tiers"]

		const content = await client.getContent()
		const currentSeason = content.Seasons.find((season) => season.IsActive && season.Type === "act")
		currentSeasonID = currentSeason.ID

		unsubscribeClientState = ClientState.subscribe((clientState) => {
			console.log("InGame | clientState:", clientState)
			fetchMatch(clientState)
		})
	})

	onDestroy(() => {
		unsubscribeClientState()
	})
</script>

<main class="container">
	<div class="scoreboard">
		<div class="container-grid-cols header-row">
			<div></div>
			<div>
				Name
			</div>
			<div class="centered-col">
				Level
			</div>
			<div class="centered-col">
				Current Rank
			</div>
			<div class="centered-col">
				Peak Rank
			</div>
		</div>
		{#each players as player}
			<div class="container-grid-cols" class:team-blue="{player.TeamID === clientTeamID}"
				 class:team-red="{player.TeamID !== clientTeamID}">
				<div class="avatar-col">
					{#if player.CharacterID !== null}
						<img alt="" src="https://media.valorant-api.com/agents/{player.CharacterID}/displayicon.png" height="100%">
					{/if}
				</div>
				<div>
					<span>
						{player.NameInfo.GameName}
					</span>
					<span style="color: #ffffff77">
						#{player.NameInfo.TagLine}
					</span>
				</div>
				<div class="centered-col">
					{player.PlayerIdentity.AccountLevel}
				</div>
				<div class="centered-col rank-col">
					{#if player.CurrentTier !== null}
						<img in:fade="{{ duration: 200 }}" alt="" src={player.CurrentTier.smallIcon}>
					{/if}
				</div>
				<div class="centered-col rank-col">
					{#if player.PeakTier !== null && player.PeakTier !== player.CurrentTier}
						<img in:fade="{{ duration: 200 }}" alt="" src={player.PeakTier.smallIcon}>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!--	<span>SelfID: {client?.selfID}</span>-->

	<!--	<button class="btn" on:click={fetchData}>Fetch</button>-->
</main>

<style>
	:root {
		--size: 64px;
	}

    .scoreboard {
        /*width: 700px;*/
        width: 80%;
        background-color: #333333;

        padding: 1px;
    }

    .header-row {
        border: 4px solid #444444;
    }

    .team-blue {
        background-color: #308376aa;
        border: 4px solid #308376;
    }

    .team-red {
        background-color: #833330aa;
        border: 4px solid #833330;
    }

	.container-grid-cols {
		display: grid;
        column-gap: 1rem;
		grid-template-columns: var(--size) 2fr 1fr 1fr 1fr;
		align-items: center;
	}

    .container-grid-cols:nth-child(n+2) {
        margin-top: 2px;
    }

	.centered-col {
		display: flex;
		flex-direction: row;
		justify-content: center;
        text-align: center;
	}

	.rank-col {
        height: 90%;
	}

    .avatar-col {
        width: var(--size);
        height: var(--size);
	}
</style>
