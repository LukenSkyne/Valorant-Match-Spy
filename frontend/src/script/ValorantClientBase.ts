import { Init, SelfID } from "../../wailsjs/go/valorant/Client"

export class ValorantClientBase {
	selfID: string = null

	async init(): Promise<boolean> {
		const res = await Init()

		if (res === true) {
			this.selfID = await SelfID()
		}

		return res
	}
}
