export function template(
    str: string,
    replaceValues: { [key: string]: string }
) {
    for (const key in replaceValues)
        str = str.replace(new RegExp(`{{${key}}}`, "gi"), replaceValues[key]);
    return str;
}
