#!/usr/bin/env node
declare class CloudStackCli {
    private verbose;
    private format;
    private timeout;
    private mcpServerPath;
    constructor();
    private log;
    private callMcpServer;
    private parseArguments;
    private formatOutput;
    private showHelp;
    private getVersion;
    private mapCommandToTool;
    private validateEnvironment;
    run(args: string[]): Promise<void>;
}
export { CloudStackCli };
//# sourceMappingURL=cli.d.ts.map