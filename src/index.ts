import { DeepPartial } from "./utils/DeepPartial";
import { CommandSetOptions } from "./models/ParseOptions";

export { makeCommand } from "./other/makeCommand";
export { Command } from "./models/Command";
export { CommandSet } from "./models/CommandSet";
export { CommandSetOptions as ParseOptions } from "./models/ParseOptions";
export { CommandResult } from "./models/CommandResult";
export { Localization } from "./models/localization/Localization";

export type PartialCommandSetOptions = DeepPartial<CommandSetOptions>;

export * as HelpUtils from "./other/HelpUtils";
export * as ListUtils from "./other/ListUtils";

export { enableDebugLogs } from "./logger";
