<script lang="ts">
	import { Quit, WindowMinimise, WindowToggleMaximise, BrowserOpenURL } from "../../../wailsjs/runtime"
	//
	import { GetCurrentVersion, GetLatestVersion, PerformSelfUpdate } from "../../../wailsjs/go/valorant/Client.js"
	import { UpdateComplete } from "../../stores/VersionData"
	//
	import Logo from "../../assets/images/vms-logo.png"
	import Dialog from "./Dialog.svelte"
	import { onMount } from "svelte"

	$: title = "Valorant Match Spy v" + currentVersion

	const doubleClickInterval = 500
	let lastClickPosX: number = null
	let lastClickPosY: number = null
	let lastClickTime: number = null
	//
	let currentVersion: string = null
	let latestVersion: string = null
	let updateCompleteDialog = false
	let updateInProgress = false

	function onClickGithub() {
		BrowserOpenURL("https://github.com/LukenSkyne/Valorant-Match-Spy/releases")
	}

	async function onClickUpdate() {
		if (updateInProgress === true) {
			return
		}

		updateInProgress = true
		$UpdateComplete = await PerformSelfUpdate()
		updateInProgress = false

		updateCompleteDialog = $UpdateComplete
	}

	function onMouseDown(e: MouseEvent) {
		let currentElement = <Element>e.target

		while (currentElement != null) {
			if (currentElement.hasAttribute("data-no-drag")) {
				return
			}

			currentElement = currentElement.parentElement
		}

		if (lastClickTime !== null &&
			(Date.now() - lastClickTime) < doubleClickInterval &&
			Math.abs(lastClickPosX - e.screenX) < 2 &&
			Math.abs(lastClickPosY - e.screenY) < 2) {
			WindowToggleMaximise()
		} else {
			window["WailsInvoke"]?.("drag")
		}

		lastClickPosX = e.screenX
		lastClickPosY = e.screenY
		lastClickTime = Date.now()
	}

	onMount(async () => {
		currentVersion = await GetCurrentVersion()
		latestVersion = await GetLatestVersion()
	})
</script>

<div class="title-bar" on:mousedown={onMouseDown}>
	<img class="logo" alt src={Logo}>
	<span class="title">
		{title}
	</span>
	{#if latestVersion !== null && $UpdateComplete === false}
		<div data-no-drag class="button update" class:disabled={updateInProgress} on:click={onClickUpdate}>
			<span>
				Update Available!
			</span>
			<svg width="18" height="18" viewBox="0 0 32 32" fill="#42BD69">
				<path d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4z"/>
				<path d="M26 14l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z"/>
			</svg>
		</div>
	{/if}
	<div data-no-drag class="button github" on:click={onClickGithub}>
		<span>
			GitHub
		</span>
		<svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
			<path d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.71 3.71 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2z"
				  fill-rule="evenodd"/>
		</svg>
	</div>
	<div data-no-drag class="control min" on:click={WindowMinimise}>
		<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
			<rect fill="currentColor" width="10" height="1" x="1" y="6"/>
		</svg>
	</div>
	<div data-no-drag class="control max" on:click={WindowToggleMaximise}>
		<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
			<rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"/>
		</svg>
	</div>
	<div data-no-drag class="control exit" on:click={Quit}>
		<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
			<polygon fill="currentColor" fill-rule="evenodd"
					 points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"/>
		</svg>
	</div>
	<Dialog bind:show={updateCompleteDialog}/>
</div>

<style>
    .title-bar {
        height: 28px;

        display: flex;
        flex-direction: row;
        align-items: center;
        user-select: none;

        background-color: #111;
    }

    .logo {
        height: 24px;
        margin-left: 4px;
    }

    .title {
        margin-left: 6px;
        font-size: 14px;

        margin-right: auto;
    }

	.github {
        margin-right: 20px;
	}

    .button {
        display: flex;
        align-items: center;
        gap: 4px;

        height: 100%;
        padding: 0 10px;

        font-size: 14px;
        cursor: pointer;

        --col-hover: hsl(139deg, 0%, 60%, 25%);
        --col-active: hsl(139deg, 0%, 40%, 25%);
    }

    .button:hover {
        background-color: var(--col-hover);
    }

    .button:hover:active {
        background-color: var(--col-active);
    }

    .update.disabled {
        opacity: 50%;
    }

    .update:not(:hover, :active, .disabled) span {
        animation: blink 2s infinite ease-in-out;
    }

    @keyframes blink {
        from {
            opacity: 100%;
        }
        50% {
            opacity: 50%;
        }
        to {
            opacity: 100%;
        }
    }

    .control {
        width: 47px;
        height: 28px;

        display: grid;
        place-items: center;

        cursor: pointer;
    }

    :is(.min, .max) {
        --col-hover: hsl(139deg, 0%, 60%, 25%);
        --col-active: hsl(139deg, 0%, 40%, 25%);
        background-color: transparent;
    }

    :is(.min, .max):hover {
        background-color: var(--col-hover);
    }

    :is(.min, .max):hover:active {
        background-color: var(--col-active);
    }

    .exit {
        --col-hover: hsl(359deg, 83%, 59%);
        --col-active: hsl(359deg, 83%, 49%);
        background-color: transparent;
    }

    .exit:hover {
        background-color: var(--col-hover);
    }

    .exit:hover:active {
        background-color: var(--col-active);
    }
</style>
