import { Writable, writable } from "svelte/store"
import type { Presence, SessionLoopState } from "../script/Typedef"

export const ClientID: Writable<string | null> = writable(null)
export const ClientState: Writable<SessionLoopState | null> = writable(null)
export const Presences: Writable<Presence[]> = writable([])
