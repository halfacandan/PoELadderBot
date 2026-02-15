// This file is a "barrel export" - it gathers all the type exports from this folder
// in one place so other files only need to import from here instead of hunting
// through multiple files. It also declares the global slashCommands variable.

export { SlashCommandConfig } from './SlashCommandConfig.js';
export { SlashCommandsMap } from './SlashCommandsMap.js';
export { UserProfile } from './UserProfile.js';
export { Ladder } from './Ladder.js';

import { SlashCommandsMap } from './SlashCommandsMap.js';

declare global {
    var slashCommands: SlashCommandsMap;
}
