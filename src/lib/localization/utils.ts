import { Localization } from "./Localization";
import { LanguageResolver, LocalizationResolver } from "./resolvers";

export function mapToLocalizationResolver(
    map: Map<string, Localization>,
    languageResolver: LanguageResolver,
): LocalizationResolver {
    return user => {
        const lang = languageResolver(user);
        return lang === undefined ? undefined : map.get(lang);
    };
}
