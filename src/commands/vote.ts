import { database } from '../main.js';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
export class VoteBuild {
    @Slash({
        name: 'upvote',
        description: 'Add an upvote for a build',
    })
    @Guard(RateLimit(TIME_UNIT.seconds, 15))
    async voteBuild(
        @SlashOption({ description: 'Build ID', name: 'id' })
        id: number,
        interaction: CommandInteraction
    ): Promise<void> {
        const user = interaction.user;

        const ok = await database.upvote(id, user.tag);

        interaction.reply({
            content: ok ? 'Your upvote has been logged!' : 'Something went wrong...',
            ephemeral: true,
        });
    }
}
