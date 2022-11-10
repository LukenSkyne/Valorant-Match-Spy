import type { CompetitiveTier } from "../components/InternalTypes"

export function compareCompetitiveTier(a: CompetitiveTier, b: CompetitiveTier) {
	if (a.divisionIndex === b.divisionIndex) {
		return a.divisionTier - b.divisionTier
	}

	return a.divisionIndex - b.divisionIndex
}
