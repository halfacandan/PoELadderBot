export interface SlashCommandConfig {
    name: string;
    description: string;
    variables?: string[];
    actionAsync: (args?:any|null) => Promise<any>;
}
