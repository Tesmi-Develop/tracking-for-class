declare function objectForEach<T extends object>(obj: T, callback: (key: keyof T, value: T[keyof T]) => void): void;
export = objectForEach;
