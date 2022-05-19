<script lang="ts">
	import { onDestroy } from "svelte"
	import { scale } from "svelte/transition"
	//
	import Button from "./Button.svelte"

	export let show: boolean
	let self: Element

	function onGlobalClick(e: PointerEvent) {
		let currentElement = <Element>e.target
		let found = false

		while (currentElement != null) {
			if (currentElement === self) {
				found = true
				break
			}

			currentElement = currentElement.parentElement
		}

		if (found === false) {
			closeModal()
		}
	}

	function closeModal() {
		show = false
		window.removeEventListener("click", onGlobalClick)
	}

	function onIntroFinished() {
		window.addEventListener("click", onGlobalClick)
	}

	onDestroy(() => {
		window.removeEventListener("click", onGlobalClick)
	})
</script>

{#if show}
	<main bind:this={self} data-no-drag class="dialogContainer" transition:scale={{ duration: 200 }} on:introend={onIntroFinished}>
		<div class="core">
			<div class="closeButton" >
				<Button text="Close" on:click={closeModal} />
			</div>
			<slot />
		</div>
	</main>
{/if}

<style>
    .closeButton {
        position: absolute;
        right: 14px;
        top: 10px;
    }

    .dialogContainer {
        position: fixed;
        display: grid;
        place-items: center;
		z-index: 1337;

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

        padding: 14px;

        background-color: #111f;
        border-radius: 4px;

        pointer-events: initial;
    }
</style>
