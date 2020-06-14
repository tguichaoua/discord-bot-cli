export interface ThrottlingDefinition {
    /** Number of times the command can be used. */
    readonly count: number;
    /** Duration after which the usage count is reset. */
    readonly duration: number;
    /** If set to true, user with administrator permission are also affected by this throttling. (default is false) */
    readonly includeAdmins?: boolean;
}