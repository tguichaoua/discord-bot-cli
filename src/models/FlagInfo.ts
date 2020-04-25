export type FlagInfo =
    {
        name: string;
    } &
    (
        {
            type: "full";
            value?: string;
        } |
        {
            type: "shortcut";
            valueIndex?: number;
        }
    );