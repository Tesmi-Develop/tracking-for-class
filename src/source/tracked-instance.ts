import { NextCallback } from "./utilities";
import { TrackingInstanceController } from "./tracking-instance-controller";

const TableLink = "__TableLink";

export const TrackedInstance = <T extends object>(instance: T) => {
	const clone = table.clone(instance);
	const originalMetatable = getmetatable(instance);
	table.clear(instance);

	const mt: LuaMetatable<object> & { __iter: () => LuaTuple<[NextCallback, object]> } = {
		__index: (t, index) => {
			return clone[index as never];
		},

		__newindex: (t, index, value) => {
			const oldValue = clone[index as never];
			const data = TrackingInstanceController.Get(instance) as TrackingInstanceController;
			if (!data) clone[index as never] = value as never;

			if (!data) return;
			if (data.GetValidators().has(index as string)) {
				if (!data.GetValidators().get(index as string)!(value, index as string)) {
					return;
				}
				clone[index as never] = value as never;
			} else {
				clone[index as never] = value as never;
			}

			if (oldValue === undefined && value !== undefined) {
				data.OnAdded.Fire(index as never, value);
			}

			if (oldValue !== value) {
				data.OnChanged.Fire(index as never, oldValue, value);
			}

			if (oldValue !== undefined && value === undefined) {
				data.OnRemoved.Fire(index as never, oldValue);
			}
		},

		__iter: () => {
			return $tuple(next, clone);
		},

		__metatable: originalMetatable as never,
	};

	instance[TableLink as never] = clone as never;
	setmetatable(instance, mt);

	return instance;
};
