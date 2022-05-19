<script lang="ts">
	import { fade } from "svelte/transition"
	//
	import type { Player, PlayerSkin } from "./InternalTypes"
	//
	import { ClientID } from "../stores/ClientData"
	//
	import RankInfo from "./FloatingRankInfo.svelte"
	import Loadout from "./Loadout.svelte"
	import Modal from "./ui/Modal.svelte"

	export let player: Player
	export let team: string

	let loadoutModalOpen = false

	$: dataTeam = $ClientID === player.Subject ? "self" : team
	$: agentImage = `https://media.valorant-api.com/agents/${player.CharacterID}/displayicon.png`
	$: playerCardImage = `https://media.valorant-api.com/playercards/${player.PlayerIdentity.PlayerCardID}/wideart.png`
	$: partyStyle = player.PartyColor === null ? null : `background-color: ${player.PartyColor}`
	$: playerLoadout = player.Loadout === null ? null : player.Loadout

	const contentTierOrder = [
		"12683d76-48d7-84a3-4e09-6985794f0445", // Select
		"0cebb8be-46d7-c12a-d306-e9907bfc5a25", // Deluxe
		"60bca009-4182-7998-dee7-b8a2558dc369", // Premium
		"411e4a55-4e59-7757-41f0-86a53f101bb5", // Ultra
		"e046854e-406c-37f4-6607-19a9ba8426fc", // Exclusive
	]
	let contentTiers = {}

	$: if (playerLoadout !== null) {
		contentTiers = {}

		for (const playerSkin: PlayerSkin of playerLoadout) {
			if (playerSkin.skin.contentTierUuid !== null) {
				contentTiers[playerSkin.skin.contentTierUuid] ??= 0
				contentTiers[playerSkin.skin.contentTierUuid]++
			}
		}
	}

	function openLoadoutModal() {
		if (playerLoadout === null) {
			return
		}

		loadoutModalOpen = true
	}
</script>

<div class="playerInfo">
	<div class="playerTop">
		{#if player.CharacterID !== null && player.CharacterID !== ""}
			<img alt src={agentImage} class="agent" data-team={dataTeam}>
		{:else}
			<div class="agent" data-team={dataTeam}>
				<img alt
					 src="https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png"
					 style="filter: opacity(15%)" height="100%" draggable="false">
			</div>
		{/if}
		<div class="cardContainer">
			<img alt src={playerCardImage} class="card" draggable="false"
				 class:cardButton={playerLoadout !== null}
				 on:click={openLoadoutModal}
			>
			{#if Object.keys(contentTiers).length > 0}
				<div class="contentTierList">
					{#each contentTierOrder as ctID}
						{#if contentTiers[ctID] !== undefined}
							<img alt class="contentTierImage" src={`https://media.valorant-api.com/contenttiers/${ctID}/displayicon.png`}>
							<div class="contentTier">
								{contentTiers[ctID]}
							</div>
						{/if}
					{/each}
				</div>
			{/if}

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
	{#if partyStyle !== null}
		<div class="party" style={partyStyle} in:fade={{duration: 200 }}></div>
	{/if}
	<Modal bind:show={loadoutModalOpen}>
		<Loadout playerName={player.NameInfo.GameName} loadoutData={playerLoadout} />
	</Modal>
</div>

<style>
	.playerInfo {
        position: relative;
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
        color: #fff6;
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
		height: 100%;
        user-select: none;
	}

	.cardButton {
        cursor: pointer;
        transition: filter 0.1s ease-out;
	}

    .cardButton:hover {
		filter: brightness(50%);
    }

    .cardButton:hover:active {
        filter: brightness(40%);
    }

    .cardButton:hover + .contentTierList {
        opacity: 1;
    }

    .contentTierList {
        position: absolute;
        left: 16px;
        top: 50%;

        display: flex;
        align-items: center;
        gap: 4px;

        height: 24px;
        padding: 0 8px 0 6px;
        border-radius: 100px;

        background-color: #0007;
        opacity: 0;

        pointer-events: none;
        user-select: none;

        transition: opacity 0.1s ease-out;
        transform: translateY(-50%);
    }

    .contentTierImage {
        height: 16px;
    }

    .contentTier {
        font-size: 14px;
    }

    .cardContainer {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .party {
        position: absolute;

		--width: 5px;
		--gap: 3px;

        width: var(--width);
        height: 100%;
        left: calc((var(--gap) + var(--width)) * -1);
        top: 0;
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
