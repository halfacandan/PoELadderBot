export interface SlashCommandConfig {
    name: string;
    description: string;
    variables?: SlashCommandVariable[]|null;
    actionAsync: (interaction?:any|null) => Promise<any>;
}

export interface SlashCommandVariable {
    name: string;
    description: string;
    type?: string|null; // Use "user" to capture a Discord Handle, otherwise it will be captured as a string
    required: boolean;
}