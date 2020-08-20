import shell from "shelljs";
import chalk from "chalk";

export default {
    require(...command: string[]) {
        const missings: string[] = command.filter((cmd) => !shell.which(cmd));

        if (missings.length !== 0) {
            shell.echo(`Sorry, this script requires ${missings.join(", ")}`);
            shell.exit(1);
        }
    },
    exec(name: string, command: string) {
        console.log(chalk.blue(name));
        const res = shell.exec(command);
        if (res.code !== 0) shell.exit(1);
        return res;
    },
};
