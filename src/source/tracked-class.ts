import Signal from "@rbxts/rbx-better-signal";
import { TrackedInstance } from "./tracked-instance";
import { ModifyMethodConstructor, ReadonlySignal } from "./utilities";

const onCreatedNewTrackedInstance = new Signal<(instance: object) => void>();
export const OnCreatedNewTrackedInstance = onCreatedNewTrackedInstance as ReadonlySignal<(instance: object) => void>;

export const TrackedClass = (ctr: object) => {
	ModifyMethodConstructor(ctr, "constructor", (originalConstructor) => {
		return function (this, ...args: unknown[]) {
			TrackedInstance(this);
			onCreatedNewTrackedInstance.Fire(this);
			return originalConstructor(this, ...args);
		};
	});
};
