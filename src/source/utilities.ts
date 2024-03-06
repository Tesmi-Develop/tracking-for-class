import Signal from "@rbxts/rbx-better-signal";

type TMethod<T> = (self: InferThis<T>, ...parameters: Parameters<T>) => ReturnType<T>;

export type NextCallback = (t: object, last: unknown) => LuaTuple<[unknown, unknown]> | undefined;

export interface ReadonlyTrackingInstanceController {
	OnAdded: ReadonlySignal<(index: string, newValue: unknown) => void>;
	OnChanged: ReadonlySignal<(index: string, oldValue: unknown, newValue: unknown) => void>;
	OnRemoved: ReadonlySignal<(index: string, oldValue: unknown) => void>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	GetValidators(): ReadonlyMap<string, (value: any, index: string) => boolean>;
	GetDecorators(): ReadonlyMap<string, (value: unknown, index: string) => unknown>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	SetValidator<T>(index: string, validator: (value: T, index: string) => boolean): void;
	RemoveValidator(index: string): void;
	Destroy(): void;

	AddDecorator(index: string, decorator: (value: unknown) => unknown): string;
	RemoveDecorator(index: string): void;
	RemoveDecorators(index: string): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReadonlySignal<T extends (...args: any) => any = () => void> = Omit<
	Signal<T>,
	"Fire" | "FireDeferred" | "DisconnectAll" | "Destroy"
>;

export interface ITrackedInstanceData extends ReadonlyTrackingInstanceController {
	OnAdded: Signal<(index: string, newValue: unknown) => void>;
	OnChanged: Signal<(index: string, oldValue: unknown, newValue: unknown) => void>;
	OnRemoved: Signal<(index: string, oldValue: unknown) => void>;
}

export const CreateGeneratorId = <C extends boolean = true, R = C extends true ? string : number>(
	isString = true as C,
) => {
	const obj = {
		freeId: 0,
		Next: (): R => {
			const id = obj.freeId;
			obj.freeId += 1;
			return (isString ? `${id}` : id) as R;
		},
	};

	return obj as { Next: () => R };
};

export const ModifyMethodConstructor = <T extends object, C extends Callback = Callback>(
	_constructor: T,
	methodName: string,
	visitor: (originalMethod: TMethod<C>) => (this: object, ...args: unknown[]) => unknown,
): T => {
	const modifiedMethod = visitor(_constructor[methodName as never]);
	_constructor[methodName as never] = modifiedMethod as never;
	return _constructor;
};
