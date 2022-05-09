<script lang="ts">
	import type { Player } from "./Typedef"
	import { fade } from "svelte/transition"

	export let player: Player
	export let team: string

	$: agentImage = `https://media.valorant-api.com/agents/${player.CharacterID}/displayicon.png`
	$: playerCardImage = `https://media.valorant-api.com/playercards/${player.PlayerIdentity.PlayerCardID}/wideart.png`
</script>

<div class="playerContainer">
	<div class="playerTop">
		{#if player.CharacterID !== null}
			<img alt src={agentImage} class="agent" data-team={team}>
		{:else}
			<div class="agent" data-team={team}>
				<img alt src="https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png" style="filter: opacity(15%)" height="100%">
			</div>
		{/if}
		<div class="card">
			<img alt src={playerCardImage} height="100%">
			{#if player.HighestTier !== null && player.CurrentTier !== null && player.LowestTier}
				<div class="floatingRankInfo" in:fade={{duration: 200 }}>
					<div class="rankInfo">
						<span class="rankPill">Highest</span>
						<!--{#if player.HighestTier === undefined}-->
						<!--	{@debug player}-->
						<!--{/if}-->
						<img alt src={player.HighestTier.largeIcon} height="100%">
					</div>
					<div class="rankInfo">
						<span class="rankPill">Current</span>
						<img alt src={player.CurrentTier.largeIcon} height="100%">
					</div>
				</div>
			{/if}
		</div>
	</div>
	<div class="playerBottom" data-team={team}>
		<span class="playerName">{player.NameInfo.GameName}</span>
		<span class="playerTag">#{player.NameInfo.TagLine}</span>
		<span class="playerLevel">Level {player.PlayerIdentity.AccountLevel}</span>
	</div>
</div>

<style>
    .playerContainer {

    }

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

    .card {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .floatingRankInfo {
        position: absolute;
        right: 0;
		height: 64px;
		padding: 4px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;

		background-color: #222a;
		border-radius: 10px 0 0 10px;
    }

	.rankInfo {
        position: relative;
        height: 30px;

        display: flex;
        flex-direction: row;

		align-items: center;
		justify-content: flex-end;
		gap: 4px;
	}

	.rankPill {
        /*background-color: #0007;*/
		border-radius: 100px;
		padding: 2px 6px;

		font-size: 12px;
	}

    .playerBottom {
        margin-top: 3px;

        height: 19px;

        display: flex;
        align-items: center;

        padding: 0 4px;

        font-size: 12px;
    }

    .playerBottom[data-team="blue"] {
        background-color: hsl(var(--blue-dark) / 50%);
    }

    .playerBottom[data-team="red"] {
        background-color: hsl(var(--red-dark) / 50%);
    }

    .playerName {

    }

    .playerTag {
        color: hsl(var(--white) / 50%);
    }

    .playerLevel {
        margin-left: auto;
        color: hsl(var(--white) / 50%);
    }
</style>
