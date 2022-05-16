<script lang="ts">
	import type { PlayerSkin } from "./InternalTypes"

	export let playerName: string
	export let loadoutData: PlayerSkin[]
</script>

<span>{playerName}</span>
<div class="loadout">
	{#each loadoutData as playerSkin}
		<div class="gunContainer">
			<div class="gun" style={`background-image: url(https://media.valorant-api.com/weaponskinchromas/${playerSkin.skinChromaID}/fullrender.png)`}>
			</div>
			<span class="gunText">
				{playerSkin.skin?.displayName}
			</span>
		</div>
	{/each}
</div>

<style>
    .gun {
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

	.gunText {
        display: inline-block;
		justify-content: center;

        height: 18px;
		font-size: 14px;
		line-height: 18px;
        text-align: center;
		padding: 0 4px;

        background-color: #fff1;

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
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

    .gunContainer {
		display: inherit;
        background-color: #fff1;
    }

    .gunContainer:nth-child(n+6) {
        grid-column: 2;
    }

    .gunContainer:nth-child(n+10) {
        grid-column: 3;
    }

    .gunContainer:nth-child(n+14) {
        grid-column: 4;
    }
</style>
