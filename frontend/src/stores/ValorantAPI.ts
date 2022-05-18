import { Writable, writable } from "svelte/store"
import type { Skin, Buddy, CompetitiveTier } from "../components/InternalTypes"

export const AllSkins: Writable<Skin[]> = writable(null)
export const AllBuddies: Writable<Buddy[]> = writable(null)
export const AllCompetitiveTiers: Writable<CompetitiveTier[]> = writable(null)
