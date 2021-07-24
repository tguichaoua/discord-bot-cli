import { jsonLocalization } from "./JsonLocalization";
import { mapToLocalizationResolver } from "./utils";

export * from "./Localization";
export * from "./Localizator";
export * from "./resolvers";

export const LocalizationUtils = Object.freeze({
    fromMap: mapToLocalizationResolver,
    fromJson: jsonLocalization,
});
