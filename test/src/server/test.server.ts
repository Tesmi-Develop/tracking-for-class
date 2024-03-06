import { OnCreatedNewTrackedInstance, TrackedClass } from "../source/tracked-class";
import { TrackingInstanceController } from "../source/tracking-instance-controller";

const Range = (min: number, max: number) => {
	return (obj: object, propertyName: string) => {
		OnCreatedNewTrackedInstance.Connect((instance) => {
			TrackingInstanceController.Get(instance).SetValidator<number>(propertyName, (value) => {
				assert(value >= min && value <= max, "value is not in range");
				return value >= min && value <= max;
			});
		});
	};
};

@TrackedClass
class A {
	@Range(0, 10)
	public Value = 0;
}

const instance = new A();
instance.Value = 11;

print(instance.Value);
