/** @ignore */
export class Prop<T> {
    private _value: T | undefined = undefined;

    constructor(private _defaultValue: T) {}

    get value() {
        return this._value ?? this._defaultValue;
    }

    set value(value: T) {
        this._value = value;
    }

    get rawValue() {
        return this._value;
    }

    set rawValue(value: T | undefined) {
        this._value = value;
    }

    inherit(parent: Prop<T>) {
        if (this._value === undefined) this._value = parent.value;
    }
}
