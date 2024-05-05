<script lang="ts">
	import type { PlayerSkin } from "./InternalTypes"
	//
	import { AllBuddies } from "../stores/ValorantAPI"
	//
	import Tooltip from "./ui/Tooltip.svelte"

	export let playerName: string
	export let loadoutData: PlayerSkin[]

	function getBuddyName(buddyID) {
		return $AllBuddies.find((buddy) => buddy.uuid === buddyID)?.displayName ?? "Unknown Buddy"
	}
</script>

<span>{playerName}</span>
<div class="loadout">
	{#each loadoutData as playerSkin}
		<div class="gunContainer">
			<div class="gun" style={`background-image: url(https://media.valorant-api.com/weaponskinchromas/${playerSkin.skinChromaID}/fullrender.png)`}>
				{#if playerSkin.buddyID !== undefined}
					<Tooltip text={getBuddyName(playerSkin.buddyID)}>
						<img alt class="gunBuddy" src={`https://media.valorant-api.com/buddies/${playerSkin.buddyID}/displayicon.png`} height="100%">
					</Tooltip>
				{/if}
			</div>
			<div class="gunInfo">
				{#if playerSkin.skin?.contentTierUuid !== null}
					<img alt class="contentTier" src={`https://media.valorant-api.com/contenttiers/${playerSkin.skin?.contentTierUuid}/displayicon.png`} height="100%">
				{/if}
				<span class="gunName">
					{playerSkin.skin?.displayName}
				</span>
			</div>
		</div>
	{/each}
</div>

<style>
	.contentTier {
		height: 16px;
	}

    .gun {
		position: relative;
		--pad: 4px;

        height: calc(82px - var(--pad) * 2);

		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		margin: var(--pad);

		display: flex;
		justify-content: center;
		align-items: center;
    }

    .gunInfo {
		display: flex;
		justify-content: center;
		align-items: center;

		gap: 2px;
        padding: 0 2px;

        background-color: #fff1;
    }

	.gunName {
        height: 18px;
        font-size: 14px;
        line-height: 18px;

        padding: 0 2px;

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
	}

    .gunBuddy {
        position: absolute;
        left: -6px;
        bottom: 0;
        height: 32px;
    }

    .gunContainer {
		display: flex;
		flex-direction: column;
        background-color: #fff1;
    }

    .gunContainer:nth-child(n+6) {
        grid-column: 2;
    }

    .gunContainer:nth-child(n+10) {
        grid-column: 3;
    }

    .gunContainer:nth-child(n+15) {
        grid-column: 4;
    }

    .loadout {
        display: grid;
        grid-template-columns: 135px 217px 243px 263px;
        grid-template-rows: repeat(5, 100px);
        grid-gap: 20px;
        grid-auto-flow: column;

        background-color: transparent;

        height: 100%;
        width: 100%;
    }
</style>
