import { Writable, writable } from "svelte/store"
import type { Presence, SessionLoopState } from "../script/Typedef"

export const ClientState: Writable<SessionLoopState | null> = writable(null)
export const Presences: Writable<Presence[]> = writable([])
