export interface ThrottlingDefinition {
    /** Number of times the command can be used. */
    readonly count: number;
    /** Duration after which the usage count is reset. */
    readonly duration: number;
}