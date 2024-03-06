import Signal from "@rbxts/rbx-better-signal";
import { CreateGeneratorId, ITrackedInstanceData, ReadonlyTrackingInstanceController } from "./utilities";

export class TrackingInstanceController implements ITrackedInstanceData {
	private static trackedInstances = new Map<object, TrackingInstanceController>();
	private static idGenerator = CreateGeneratorId();

	constructor(private trackedInstance: object) {}

	public static Get(instance: object) {
		if (TrackingInstanceController.trackedInstances.has(instance))
			return TrackingInstanceController.trackedInstances.get(instance) as ReadonlyTrackingInstanceController;
		const data = new TrackingInstanceController(instance);
		TrackingInstanceController.trackedInstances.set(instance, data);
		return data as ReadonlyTrackingInstanceController;
	}

	public static Has(instance: object) {
		return TrackingInstanceController.trackedInstances.has(instance);
	}

	public static Create(instance: object) {
		if (TrackingInstanceController.trackedInstances.has(instance))
			return TrackingInstanceController.trackedInstances.get(instance)! as ReadonlyTrackingInstanceController;
		const data = new TrackingInstanceController(instance);
		TrackingInstanceController.trackedInstances.set(instance, data);
		return data as ReadonlyTrackingInstanceController;
	}

	public OnAdded = new Signal<(index: unknown, newValue: unknown) => void>();
	public OnChanged = new Signal<(index: unknown, oldValue: unknown, newValue: unknown) => void>();
	public OnRemoved = new Signal<(index: unknown, oldValue: unknown) => void>();

	private validators = new Map<string, (value: unknown, index: string) => boolean>();
	//private visitors = new Map<string, (value: unknown, index: string) => unknown>();
	private decorators = new Map<string, (value: unknown, index: string) => unknown>();

	public GetValidators() {
		return this.validators as ReadonlyMap<string, (value: unknown, index: string) => boolean>;
	}

	public GetDecorators() {
		return this.decorators as ReadonlyMap<string, (value: unknown, index: string) => unknown>;
	}

	public Destroy() {
		TrackingInstanceController.trackedInstances.delete(this.trackedInstance);
		setmetatable(this, undefined!);
	}

	public SetValidator<T>(fieldName: string, validator: (value: T, index: string) => boolean) {
		this.validators.set(fieldName, validator as never);
	}

	public RemoveValidator(fieldName: string) {
		this.validators.delete(fieldName);
	}

	public AddDecorator(index: string, decorator: (value: unknown) => unknown) {
		const newId = TrackingInstanceController.idGenerator.Next();
		this.decorators.set(newId, decorator as never);

		return newId;
	}

	public RemoveDecorator(id: string) {
		this.decorators.delete(id);
	}

	public RemoveDecorators() {
		this.decorators.clear();
	}
}
