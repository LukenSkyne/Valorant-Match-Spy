<script lang="ts">
	import { fade } from "svelte/transition"
	//
	import { ClientState } from "../stores/ClientData.js"
	//
	import Logo from "../assets/images/vms-logo.png"
</script>

<div transition:fade={{ duration: 200 }} class="container menus">
	<img height="25%" alt src={Logo}>
	{#if $ClientState === null}
		<span>Waiting for Valorant to Start...</span>
	{:else}
		<span>Waiting for Match...</span>
	{/if}
</div>

<style>
	.menus {
        z-index: 200;
		position: absolute;
        left: 0;
		top: 0;

        background-color: #222;
	}
</style>
