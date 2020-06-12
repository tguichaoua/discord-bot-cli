export interface ThrottlingDefinition {
    /** Number of times the command can be used. */
    count: number;
    /** Duration after which the usage count is reset. */
    duration: number;
}