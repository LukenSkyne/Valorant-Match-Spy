<script lang="ts">
	import { scale } from "svelte/transition"
	//
	import { Quit } from "../../../wailsjs/runtime"
	//
	import Button from "./Button.svelte"

	export let show: boolean

	function onConfirm() {
		show = false
		Quit()
	}

	function onCancel() {
		show = false
	}
</script>

{#if show}
	<main data-no-drag class="dialogContainer" transition:scale={{ duration: 200 }}>
		<div class="core">
			<span class="text">
				<span style="color: #42bd68">
					Update Ready!
				</span>
				<span>
					please restart to switch to the latest version
				</span>
			</span>
			<div class="footer">
				<Button text="Exit Now" type="error" callback={onConfirm} />
				<Button text="Cancel" type="default" callback={onCancel} />
			</div>
		</div>
	</main>
{/if}

<style>
	.dialogContainer {
		position: fixed;
		display: grid;
		place-items: center;

		left: 0;
		top: 0;
		width: 100vw;
		height: 100vh;

		pointer-events: none;
	}

	.core {
        position: relative;
		display: flex;
		flex-direction: column;

		align-items: center;
		justify-content: center;
		gap: 20px;

        width: 310px;
        height: 200px;
        padding: 10px;

        background-color: #111;
		border-radius: 4px;

        pointer-events: initial;
	}

	.text {
        display: flex;
		flex-direction: column;
		gap: 10px;
		text-align: center;
	}

	.footer {
		position: absolute;
		bottom: 10px;

		display: flex;
		gap: 10px;
	}
</style>

