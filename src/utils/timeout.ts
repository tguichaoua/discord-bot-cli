/**
 * Return the number of seconds left before the timeout is out.
 * @param timeout
 * @internal
 */
export function getTimeLeft(timeout: NodeJS.Timeout): number {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((timeout as any)._idleStart + (timeout as any)._idleTimeout) / 1000 -
        process.uptime()
    );
}
