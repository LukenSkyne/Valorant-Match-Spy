<script lang="ts">
	import type { Player } from "./Typedef"
	import { fade } from "svelte/transition"

	export let player: Player
	export let team: string

	$: agentImage = `https://media.valorant-api.com/agents/${player.CharacterID}/displayicon.png`
	$: playerCardImage = `https://media.valorant-api.com/playercards/${player.PlayerIdentity.PlayerCardID}/wideart.png`
</script>

<div>
	<div class="playerTop">
		{#if player.CharacterID !== null}
			<img alt src={agentImage} class="agent" data-team={team}>
		{:else}
			<div class="agent" data-team={team}>
				<img alt
					 src="https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png"
					 style="filter: opacity(15%)" height="100%">
			</div>
		{/if}
		<div class="card">
			<img alt src={playerCardImage} height="100%">
			{#if player.HighestTier !== null || player.CurrentTier !== null}
				<div class="floatingRankInfo" in:fade={{duration: 200 }}>
					{#if player.HighestTier !== null}
						<div class="rankInfo">
							<span class="rankText">
								Highest
							</span>
							<img alt src={player.HighestTier.smallIcon} height="100%">
						</div>
					{/if}
					{#if player.CurrentTier !== null}
						<div class="rankInfo">
							<span class="rankText">
								Current
							</span>
							<img alt src={player.CurrentTier.smallIcon} height="100%">
						</div>
					{/if}
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
        padding: 4px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;

        background-color: #2227;
        border-radius: 4px 0 0 4px;
        backdrop-filter: blur(2px);
    }

    .rankInfo {
        position: relative;
        height: 32px;

        display: flex;
        flex-direction: row;

        align-items: center;
        justify-content: flex-end;
        gap: 4px;
    }

    .rankText {
        padding: 2px 6px;
        font-size: 13px;
    }

    .playerBottom {
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
