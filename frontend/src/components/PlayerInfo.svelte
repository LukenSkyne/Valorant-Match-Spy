<script lang="ts">
	import type { Player } from "./Typedef"
	//
	import { ClientID } from "../stores/ClientData"
	//
	import RankInfo from "./FloatingRankInfo.svelte"

	export let player: Player
	export let team: string

	$: dataTeam = $ClientID === player.Subject ? "self" : team
	$: agentImage = `https://media.valorant-api.com/agents/${player.CharacterID}/displayicon.png`
	$: playerCardImage = `https://media.valorant-api.com/playercards/${player.PlayerIdentity.PlayerCardID}/wideart.png`
</script>

<div>
	<div class="playerTop">
		{#if player.CharacterID !== null}
			<img alt src={agentImage} class="agent" data-team={dataTeam}>
		{:else}
			<div class="agent" data-team={dataTeam}>
				<img alt
					 src="https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png"
					 style="filter: opacity(15%)" height="100%">
			</div>
		{/if}
		<div class="card">
			<img alt src={playerCardImage} height="100%">
			{#if player.HighestTier !== null || player.CurrentTier !== null}
				<RankInfo highestTier={player.HighestTier}
						  currentTier={player.CurrentTier}
						  lowestTier={player.LowestTier}
				/>
			{/if}
		</div>
	</div>
	<div class="playerBottom" data-team={dataTeam}>
		<span class="playerName">{player.NameInfo.GameName}</span>
		<span class="playerTag">#{player.NameInfo.TagLine}</span>
		<span class="playerLevel">Level {player.PlayerIdentity.AccountLevel}</span>
		{#if player.CurrentRankedRating !== null}
			<span class="playerRR">{player.CurrentRankedRating ?? 0}RR</span>
		{/if}
	</div>
</div>

<style>
    .playerTop {
        height: 92px;
        display: flex;
        gap: 3px;
    }

    .agent {
        height: 92px;
        aspect-ratio: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff6
    }

    .agent[data-team="blue"] {
        background-color: hsl(var(--blue-darker) / 50%);
    }

    .agent[data-team="red"] {
        background-color: hsl(var(--red-darker) / 50%);
    }

    .agent[data-team="self"] {
        background-color: hsl(var(--yellow-darker) / 100%);
    }

    .card {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .playerBottom {
		position: relative;
        display: flex;
        align-items: center;

        height: 19px;
        margin-top: 3px;
        padding: 0 4px;
        font-size: 13px;
    }

    .playerBottom[data-team="blue"] {
        background-color: hsl(var(--blue-dark) / 50%);
    }

    .playerBottom[data-team="red"] {
        background-color: hsl(var(--red-dark) / 50%);
    }

    .playerBottom[data-team="self"] {
        background-color: hsl(var(--yellow-dark) / 100%);
    }

	.playerBottom[data-team="self"] :is(.playerName, .playerTag, .playerLevel, .playerRR) {
		filter: invert();
	}

    .playerName {
        /* placeholder */
    }

    .playerTag {
        color: hsl(var(--white) / 50%);
    }

    .playerLevel {
		position: absolute;
        left: 50%;
        transform: translate(-25%, 0); /* change this to -50% to center it */
        color: hsl(var(--white) / 50%);
    }

	.playerRR {
        position: absolute;
		right: 4px;
        color: hsl(var(--white) / 50%);
	}
</style>
