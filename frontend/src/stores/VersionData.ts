import { Writable, writable } from "svelte/store"

export const UpdateComplete: Writable<boolean> = writable(false)
