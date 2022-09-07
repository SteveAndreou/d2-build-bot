import { database } from './../main';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
export class DeleteBuild {
    @Slash({
        name: 'delete',
        description: 'Removes a build to the build bot',
    })
    @Guard(RateLimit(TIME_UNIT.seconds, 30))
    async deleteBuild(
        @SlashOption({ description: 'Build ID', name: 'id' })
        id: string,
        interaction: CommandInteraction
    ): Promise<void> {
        const user = interaction.user;

        const ok = await database.delete(id, user.tag);

        if (ok) {
            interaction.reply('Build removed.');
        }
    }
}
