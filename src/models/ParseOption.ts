export default interface ParseOption {
    prefix: string;
    helpOnSignatureNotFound: boolean;
    deleteMessageIfCommandNotFound: boolean;
    devIDs: string[];
}