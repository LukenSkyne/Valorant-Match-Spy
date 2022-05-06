<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import type { Unsubscriber } from "svelte/store"
	//
	import { ValorantClient } from "../script/ValorantClient"
	import type {
		CoreGameMatch,
		MatchTeam,
		PlayerIdentity,
		PlayerName,
		PreGameMatch,
		SeasonalBadgeInfo, SessionLoopState,
	} from "../script/Typedef"
	//
	import { ClientState } from "../stores/Data"

	interface Player {
		Subject: string, // uuid
		TeamID: MatchTeam,
		CharacterID: string | null,
		PlayerIdentity: PlayerIdentity,
		SeasonalBadgeInfo: SeasonalBadgeInfo,
		PlayerName: PlayerName,
	}

	// props
	export let client: ValorantClient

	// members
	let unsubscribeClientState: Unsubscriber
	let preGameMatchData: PreGameMatch
	let coreGameMatchData: CoreGameMatch
	let clientTeamID: MatchTeam
	let players: Player[] = []

	async function fetchMatch(clientState: SessionLoopState | null) {
		if (clientState === "PREGAME") {
			console.log("Fetching PreGame")

			const playerData = await client.getPreGamePlayerData(client.selfID)
			preGameMatchData = await client.getPreGameMatch(playerData.MatchID)
			const playerNames = await client.getNames(preGameMatchData.AllyTeam.Players.map((player) => player.Subject))

			clientTeamID = preGameMatchData.AllyTeam.TeamID

			for (const teamMember of preGameMatchData.AllyTeam.Players) {
				players.push({
					Subject: teamMember.Subject,
					TeamID: clientTeamID,
					PlayerName: playerNames.find((playerName) => playerName.Subject === teamMember.Subject),
					PlayerIdentity: teamMember.PlayerIdentity,
					SeasonalBadgeInfo: teamMember.SeasonalBadgeInfo,
					CharacterID: null,
				})
			}

			players = players // explicit update
		} else if (clientState === "INGAME") {
			console.log("Fetching CoreGame")

			const playerData = await client.getCoreGamePlayerData(client.selfID)
			coreGameMatchData = await client.getCoreGameMatch(playerData.MatchID)
			const playerNames = await client.getNames(coreGameMatchData.Players.map((player) => player.Subject))

			while (players.length) {
				players.pop()
			}

			for (const corePlayer of coreGameMatchData.Players) {
				players.push({
					Subject: corePlayer.Subject,
					TeamID: corePlayer.TeamID,
					PlayerName: playerNames.find((playerName) => playerName.Subject === corePlayer.Subject),
					PlayerIdentity: corePlayer.PlayerIdentity,
					SeasonalBadgeInfo: corePlayer.SeasonalBadgeInfo,
					CharacterID: corePlayer.CharacterID,
				})
			}

			players = players // explicit update
		}
	}

	onMount(() => {
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
		{#each players as player}
			<div class="player" class:teamBlue={player.TeamID === clientTeamID} class:teamRed={player.TeamID !== clientTeamID}>
				{#if player.CharacterID !== null}
					<img alt="" src="https://media.valorant-api.com/agents/{player.CharacterID}/displayicon.png"
						 height="100%">
				{/if}
				<span class="playerName">
					<span>
						{player.PlayerName.GameName}
					</span>
					<span style="color: #ffffff77">
						#{player.PlayerName.TagLine}
					</span>
				</span>
				<span class="playerLevel">
					Level {player.PlayerIdentity.AccountLevel}
				</span>
			</div>
		{/each}
	</div>

	<!--	<span>SelfID: {client?.selfID}</span>-->

	<!--	<button class="btn" on:click={fetchData}>Fetch</button>-->
</main>

<style>
    .scoreboard {
        width: 700px;
        background-color: #333333;

        padding: 1px;
    }

    .player {
        display: flex;
        flex-direction: row;
        align-items: center;

        height: 64px;

        background-color: #222222;
    }

    .player:not(:first-child) {
        margin-top: 1px;
    }

    .playerName {
        width: 200px;
        margin-left: 1rem;

        /*white-space: nowrap;*/
        /*overflow: hidden;*/
        /*text-overflow: ellipsis;*/
    }

    .playerLevel {
        margin-left: 1rem;
    }

    .teamBlue {
        background-color: #308376aa;
    }

    .teamRed {
        background-color: #833330aa;
    }
</style>
