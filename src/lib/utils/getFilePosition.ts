export function getFilePosition(src: string, position: number): [number, number] {
    src = src.substring(0, position);
    const matches = src.match(/^.*$/gm);

    if (matches) {
        const line = matches.length;
        const col = line === 1 ? position : matches[line - 1]!.length; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        return [line, col];
    } else {
        return [1, position];
    }
}
