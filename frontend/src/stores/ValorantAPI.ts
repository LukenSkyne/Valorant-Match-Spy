import { Writable, writable } from "svelte/store"
import type { Buddy, CompetitiveSeasonMap, CompetitiveTierInfoMap, Skin } from "../components/InternalTypes"

export const AllSkins: Writable<Skin[]> = writable(null)
export const AllBuddies: Writable<Buddy[]> = writable(null)
export const AllCompetitiveTierInfo: Writable<CompetitiveTierInfoMap> = writable(null)
export const AllCompetitiveSeasons: Writable<CompetitiveSeasonMap> = writable(null)
