import { ParsableDef } from "./def/ParsableDef";
import { ParsableType, ParsableTypeName, getDefaultValue } from "./ParsableType";

export class Parsable {

    public readonly name: string;
    public readonly description?: string;
    public readonly type: ParsableTypeName;
    private _validator?: (o: any) => boolean;
    public readonly defaultValue: ParsableType;

    constructor(name: string, def: ParsableDef) {
        this.name = name;
        this.description = def.description;
        this.type = def.type;
        this._validator = def.validator;
        this.defaultValue = def.defaultValue ?? getDefaultValue(def.type);
    }

    parse(argument: string): ParsableType | undefined {
        let value = undefined;
        switch (this.type) {
            case "string":
                value = argument;
                break;
            case "integer":
                value = parseInt(argument);
                break;
            case "float":
                value = parseFloat(argument);
                break;
            case "boolean":
                switch (argument.toLocaleLowerCase()) {
                    case "true":
                    case "1":
                        value = true;
                        break;
                    case "false":
                    case "0":
                        value = false;
                        break;
                }
                break;
        }
        if (value !== undefined && (!this._validator || this._validator(value)))
            return value;
    }

}