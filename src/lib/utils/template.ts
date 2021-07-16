/** @internal */
export function template(str: string, replaceValues: { [key: string]: string }) {
    Object.entries(replaceValues).forEach(([k, v]) => (str = str.replace(new RegExp(`{{${k}}}`, "gi"), v)));
    return str;
}
