<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import type { Unsubscriber } from "svelte/store"
	//
	//import { ValorantClient } from "../script/ValorantClient"
	import { ValorantClient } from "../script/ValorantClientMock"
	import type { CoreGameMatch, MatchTeam, PreGameMatch, SessionLoopState } from "../script/Typedef"
	import type { CompetitiveTier, Player } from "./Typedef"
	import PlayerInfo from "./PlayerInfo.svelte"
	//
	import { ClientID, ClientState } from "../stores/ClientData"

	// members
	let unsubscribeClientState: Unsubscriber
	let preGameMatchData: PreGameMatch
	let coreGameMatchData: CoreGameMatch
	let clientTeamID: MatchTeam
	let players: Player[] = []

	$: allies = players.filter((p) => p.TeamID === clientTeamID)
	$: enemies = players.filter((p) => p.TeamID !== clientTeamID)

	let tierList: CompetitiveTier[] = []
	let currentSeasonID: string = null
	let backgroundUrl: string = null

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
			await new Promise(resolve => setTimeout(resolve, 100))
			const playerMMR = await ValorantClient.getMMR(player.Subject)

			if (playerMMR === null) {
				console.error("PLAYER MMR REQUEST FAILED")
				break
			}

			const seasonalInfoMap = playerMMR.QueueSkills?.competitive?.SeasonalInfoBySeasonID
			let rankHighest = 0
			let rankLowest = -1

			for (const {CompetitiveTier} of Object.values(seasonalInfoMap ?? {})) {
				if (rankHighest < CompetitiveTier) {
					rankHighest = CompetitiveTier
				}

				if ((rankLowest > CompetitiveTier || rankLowest === -1) && CompetitiveTier > 2) {
					rankLowest = CompetitiveTier
				}
			}

			const currentSeasonStats = seasonalInfoMap?.[currentSeasonID]
			const rankNow = currentSeasonStats?.CompetitiveTier ?? 0
			const rrNow = currentSeasonStats?.RankedRating ?? 0

			player.HighestTier = tierList[rankHighest]
			player.CurrentTier = tierList[rankNow]
			player.LowestTier = tierList[rankLowest]
			player.CurrentRankedRating = rrNow

			console.debug("Player", player.NameInfo.GameName, player.HighestTier, player.CurrentTier, player.LowestTier)

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

		const content = await ValorantClient.getContent()
		const currentSeason = content.Seasons.find((season) => season.IsActive && season.Type === "act")
		currentSeasonID = currentSeason.ID

		unsubscribeClientState = ClientState.subscribe((clientState) => {
			console.log("InGame | clientState:", clientState)
			fetchMatch(clientState)
		})
	})

	onDestroy(() => {
		unsubscribeClientState?.()
	})
</script>

<main class="gameContainer" style="--background-url: url({backgroundUrl})">
	<!-- ALLIES -->
	{#if allies.length > 0}
		<div class="teamContainer">
			<span class="teamTitle" data-team="blue" class:ocd={$ClientState === "PREGAME"}>
				{$ClientState === "PREGAME" ?
					"A G E N T   S E L E C T I O N   P H A S E" :
					"A L L I E S"}
			</span>

			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268.39 10.79">
				<defs>
					<style>.top-1, .top-2 {
                        fill: none;
                        stroke-miterlimit: 10;
                    }

                    .top-1 {
                        stroke: #868998;
                    }

                    .top-2 {
                        stroke: #eaeff3;
                        stroke-width: 2px;
                    }

                    .top-3 {
                        fill: #eaeff3;
                    }
					</style>
				</defs>
				<line class="top-1" x1="1.99" y1="5.05" x2="111.59" y2="5.05"/>
				<line class="top-1" x1="266.4" y1="5.05" x2="156.79" y2="5.05"/>
				<path class="top-2"
					  d="M318.19,419.31h-15.3a4.7,4.7,0,0,0-2.9,1l-4.4,3.47-4.41-3.47a4.65,4.65,0,0,0-2.89-1H273"
					  transform="translate(-161.39 -414.26)"/>
				<rect class="top-3" x="293.97" y="414.93" width="3.23" height="3.23"
					  transform="translate(-369.36 -83.24) rotate(-45)"/>
				<rect class="top-3" x="161.83" y="418.25" width="2.11" height="2.11"
					  transform="translate(-410.18 -176.27) rotate(-45)"/>
				<rect class="top-3" x="427.23" y="418.25" width="2.11" height="2.11"
					  transform="translate(-332.45 11.4) rotate(-45)"/>
			</svg>

			{#each allies as ally}
				<PlayerInfo player={ally} team="blue"/>
			{/each}

			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268.39 23.54">
				<defs>
					<style>.bot-1 {
                        fill: #585b60;
                    }

                    .bot-2, .bot-5 {
                        fill: none;
                        stroke-miterlimit: 10;
                    }

                    .bot-2 {
                        stroke: #7f838c;
                    }

                    .bot-3 {
                        fill: #eaeff3;
                    }

                    .bot-4 {
                        fill: #f3f4f8;
                    }

                    .bot-5 {
                        stroke: #f3f4f8;
                    }
					</style>
				</defs>
				<rect class="bot-1" x="130.53" y="3.93" width="7.32" height="19.61" rx="3.66"/>
				<line class="bot-2" x1="266.4" y1="7.76" x2="1.99" y2="7.76"/>
				<rect class="bot-3" x="102.69" y="560.68" width="2.11" height="2.11"
					  transform="translate(-469.07 -316.09) rotate(-45)"/>
				<rect class="bot-3" x="368.09" y="560.68" width="2.11" height="2.11"
					  transform="translate(-391.34 -128.43) rotate(-45)"/>
				<rect class="bot-4" x="132.69" y="6.64" width="3" height="14.2" rx="1.5"/>
				<circle class="bot-5" cx="134.19" cy="7.76" r="7.26"/>
			</svg>
		</div>
	{/if}

	<!-- ENEMIES -->
	{#if enemies.length > 0}
		<div class="teamContainer">
			<span class="teamTitle" data-team="red">E N E M I E S</span>

			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268.39 10.79">
				<defs>
					<style>.top-1, .top-2 {
                        fill: none;
                        stroke-miterlimit: 10;
                    }

                    .top-1 {
                        stroke: #868998;
                    }

                    .top-2 {
                        stroke: #eaeff3;
                        stroke-width: 2px;
                    }

                    .top-3 {
                        fill: #eaeff3;
                    }
					</style>
				</defs>
				<line class="top-1" x1="1.99" y1="5.05" x2="111.59" y2="5.05"/>
				<line class="top-1" x1="266.4" y1="5.05" x2="156.79" y2="5.05"/>
				<path class="top-2"
					  d="M318.19,419.31h-15.3a4.7,4.7,0,0,0-2.9,1l-4.4,3.47-4.41-3.47a4.65,4.65,0,0,0-2.89-1H273"
					  transform="translate(-161.39 -414.26)"/>
				<rect class="top-3" x="293.97" y="414.93" width="3.23" height="3.23"
					  transform="translate(-369.36 -83.24) rotate(-45)"/>
				<rect class="top-3" x="161.83" y="418.25" width="2.11" height="2.11"
					  transform="translate(-410.18 -176.27) rotate(-45)"/>
				<rect class="top-3" x="427.23" y="418.25" width="2.11" height="2.11"
					  transform="translate(-332.45 11.4) rotate(-45)"/>
			</svg>

			{#each enemies as enemy}
				<PlayerInfo player={enemy} team="red"/>
			{/each}

			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268.39 23.54">
				<defs>
					<style>.bot-1 {
                        fill: #585b60;
                    }

                    .bot-2, .bot-5 {
                        fill: none;
                        stroke-miterlimit: 10;
                    }

                    .bot-2 {
                        stroke: #7f838c;
                    }

                    .bot-3 {
                        fill: #eaeff3;
                    }

                    .bot-4 {
                        fill: #f3f4f8;
                    }

                    .bot-5 {
                        stroke: #f3f4f8;
                    }
					</style>
				</defs>
				<rect class="bot-1" x="130.53" y="3.93" width="7.32" height="19.61" rx="3.66"/>
				<line class="bot-2" x1="266.4" y1="7.76" x2="1.99" y2="7.76"/>
				<rect class="bot-3" x="102.69" y="560.68" width="2.11" height="2.11"
					  transform="translate(-469.07 -316.09) rotate(-45)"/>
				<rect class="bot-3" x="368.09" y="560.68" width="2.11" height="2.11"
					  transform="translate(-391.34 -128.43) rotate(-45)"/>
				<rect class="bot-4" x="132.69" y="6.64" width="3" height="14.2" rx="1.5"/>
				<circle class="bot-5" cx="134.19" cy="7.76" r="7.26"/>
			</svg>
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

        /*--background-url: url("https://preview.redd.it/je17twdg3jy61.png?width=1920&format=png&auto=webp&s=389d80f118a9ce37df13e772fde94e4344bd0d91");*/

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
