<script lang="ts">
	export let text: string
	export let type: "default" | "disabled" | "success" | "warning" | "error" = "default"
</script>

<div class="btnContainer" on:click>
	<div class="btn {type}">
		{text}
	</div>
</div>

<style>
	.btnContainer {
        cursor: pointer;
	}

    .btn {
        font-family: "DIN Next LT", sans-serif;
        padding: 6px 10px;
        color: white;

        text-align: center;
        text-decoration: none;

        font-size: 16px;

        border: none;
        border-radius: 2px;

        background-color: var(--col);

		user-select: none;
		transition: all 50ms ease-in;
    }

    .btnContainer:hover .btn {
        background-color: var(--col-hover);
    }

    .btnContainer:hover:active .btn {
        background-color: var(--col-active);
		transform: scale(0.9);
    }

    .btnContainer:hover:active .disabled {
        background-color: var(--col-hover);
        transform: initial;
	}

	.disabled {
		cursor: not-allowed;
		color: #484848;

        --col: hsl(139deg, 0%, 50%);
        --col-hover: hsl(139deg, 0%, 60%);
        --col-active: hsl(139deg, 0%, 40%);
	}

	.default {
        --col: hsl(139deg, 0%, 50%);
        --col-hover: hsl(139deg, 0%, 60%);
        --col-active: hsl(139deg, 0%, 40%);
	}

    .success {
        --col: hsl(139deg, 48%, 50%);
        --col-hover: hsl(139deg, 48%, 60%);
        --col-active: hsl(139deg, 48%, 40%);
    }

    .error {
        --col: hsl(359deg, 83%, 59%);
        --col-hover: hsl(359deg, 83%, 69%);
        --col-active: hsl(359deg, 83%, 49%);
    }
</style>
