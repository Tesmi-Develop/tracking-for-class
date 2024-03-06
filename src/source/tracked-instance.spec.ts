/// <reference types="@rbxts/testez/globals" />

import objectForEach from "./object-foreach";
import { TrackedInstance } from "./tracked-instance";
import { TrackingInstanceController } from "./tracking-instance-controller";

class TestClass {
	public Value = 0;
	public Value1 = 0;

	public SetValue(value: number) {
		this.Value = value;
	}

	public GetValue() {
		return this.Value;
	}
}

export = () => {
	it("Should invoked tracked-instance", () => {
		const instance = {};
		TrackedInstance(instance);
	});

	describe("With object data", () => {
		it("Should index value", () => {
			const instance = {
				value: 5,
			};
			TrackedInstance(instance);

			expect(instance.value).to.equal(5);
		});

		it("Should changed value", () => {
			const instance = {
				value: 5,
			};
			TrackedInstance(instance);
			instance.value = 10;
			expect(instance.value).to.equal(10);
		});

		it("Should iterate instance", () => {
			const instance = {
				value: 5,
				value1: 10,
			};
			TrackedInstance(instance);

			const storage = {} as typeof instance;

			objectForEach(instance, (key, value) => {
				storage[key] = value;
			});

			expect(storage.value).to.equal(5);
			expect(storage.value1).to.equal(10);
		});

		it("Should create and destroy tracking data", () => {
			const instance = {
				value: 5,
				value1: 10,
			};
			TrackedInstance(instance);

			const subscribeData = TrackingInstanceController.Create(instance);
			subscribeData.Destroy();
			expect(TrackingInstanceController.Has(instance)).to.equal(false);
		});

		it("Should invoked event onChange", () => {
			const instance = {
				value: 5,
				value1: 10,
			};
			TrackedInstance(instance);

			const subscribeData = TrackingInstanceController.Create(instance);
			let oldValue = -1;
			let newValue = -1;

			subscribeData.OnChanged.Connect((index, old, newVal) => {
				oldValue = old as number;
				newValue = newVal as number;
			});

			instance.value = 20;

			task.wait(0.1);
			expect(oldValue).to.equal(5);
			expect(newValue).to.equal(20);
			subscribeData.Destroy();
		});

		it("Should invoked event onAdded", () => {
			const instance = {
				value: undefined,
				value1: 10,
			};
			TrackedInstance(instance);

			const subscribeData = TrackingInstanceController.Create(instance);
			let newValue = -1;

			subscribeData.OnAdded.Connect((index, newVal) => {
				newValue = newVal as number;
			});

			instance.value = 20 as never;

			task.wait(0.1);
			expect(newValue).to.equal(20);
			subscribeData.Destroy();
		});

		it("Should invoked event onRemoved", () => {
			const instance = {
				value: 5,
				value1: 10,
			};
			TrackedInstance(instance);

			const subscribeData = TrackingInstanceController.Create(instance);
			let newValue = 5;

			subscribeData.OnRemoved.Connect((index, oldVal) => {
				newValue = undefined as never;
			});

			instance.value = undefined as never;

			task.wait(0.1);
			expect(newValue).to.equal(undefined);
			subscribeData.Destroy();
		});
	});

	describe("With class instance", () => {
		it("Should create class instance", () => {
			const instance = new TestClass();
			instance.Value = 10;
			TrackedInstance(instance);

			expect(instance.GetValue()).to.equal(10);
		});
		it("Should index value", () => {
			const instance = new TestClass();
			instance.SetValue(10);
			TrackedInstance(instance);

			expect(instance.Value).to.equal(10);
		});

		it("Should changed value", () => {
			const instance = new TestClass();
			TrackedInstance(instance);
			instance.Value = 10;

			expect(instance.Value).to.equal(10);
		});

		it("Should iterate instance", () => {
			const instance = new TestClass();
			instance.Value = 5;
			instance.Value1 = 10;
			TrackedInstance(instance);

			const storage = {} as typeof instance;

			objectForEach(instance, (key, value) => {
				storage[key as never] = value as never;
			});

			expect(storage.Value).to.equal(5);
			expect(storage.Value1).to.equal(10);
		});

		it("Should create and destroy tracking data", () => {
			const instance = new TestClass();
			instance.Value = 5;
			instance.Value1 = 10;
			TrackedInstance(instance);

			const subscribeData = TrackingInstanceController.Create(instance);
			subscribeData.Destroy();

			expect(TrackingInstanceController.Has(instance)).to.equal(false);
		});

		it("Should invoked event onChange", () => {
			const instance = new TestClass();
			instance.Value = 5;
			instance.Value1 = 10;
			TrackedInstance(instance);

			const controller = TrackingInstanceController.Create(instance);
			let oldValue = -1;
			let newValue = -1;

			controller.OnChanged.Connect((index, old, newVal) => {
				oldValue = old as number;
				newValue = newVal as number;
			});

			instance.Value = 20;

			task.wait(0.1);
			expect(oldValue).to.equal(5);
			expect(newValue).to.equal(20);
			controller.Destroy();
		});
	});

	it("Should work validators", () => {
		const validator = (value: number, index: string) => {
			return value > 10;
		};

		const instance = new TestClass();
		TrackedInstance(instance);

		const data = TrackingInstanceController.Create(instance);
		data.SetValidator("Value", validator);

		instance.Value = 11;
		expect(instance.Value).to.equal(11);

		instance.Value = 0;
		expect(instance.Value).to.equal(11);
	});

	it("Should return metatable", () => {
		const instance = new TestClass();
		TrackedInstance(instance);

		expect(getmetatable(instance)).to.equal(TestClass);
	});
};
