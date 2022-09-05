import { Builds } from './../types.js';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { db } from '../main.js';

@Discord()
export class FindBuild {
    @Slash({
        name: 'find',
        description: 'Find a build to play',
    })
    async findBuild(
        @SlashOption({ description: 'Guardian class', name: 'guardian' })
        guardian: string,
        interaction: CommandInteraction
    ): Promise<void> {
        const result = await this.find(guardian);
        interaction.reply(result);
    }

    async find(guardian: string) {
        let output = '';
        const builds = await db
            .from<Builds>('builds')
            .select('id, link, class, subclass')
            .filter('class', 'eq', guardian);

        console.log(builds);
        if (builds.data) {
            output = builds.data.map((x) => x.link).join('\u000D');
        }

        return output;
    }
}
