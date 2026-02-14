export interface SlashCommandConfig {
    name: string;
    description: string;
    actionAsync: () => Promise<any>;
}

export interface SlashCommandsMap {
    [key: string]: SlashCommandConfig;
}

declare global {
    var slashCommands: SlashCommandsMap;
}

export {};
