import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';

@Discord()
export class DeleteBuild {
    @Slash({
        name: 'delete',
        description: 'Removes a build to the build bot',
    })
    async deleteBuild(
        @SlashOption({ description: 'Build ID', name: 'id' })
        id: string,
        interaction: CommandInteraction
    ): Promise<void> {
        interaction.reply('This feature has not been built yet...');
    }
}
