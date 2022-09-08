import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, Guard } from 'discordx';
import { database } from '../main.js';
import { DestinyBuild } from '../destiny/build.js';
import { DIM } from '../destiny/dim.js';
import { BuildDiscordEmbed } from '../helpers/embeds.js';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
export class RandomBuild {
    @Slash({
        name: 'random',
        description: 'Random a build to play',
    })
    @Guard(RateLimit(TIME_UNIT.seconds, 30))
    async randomBuild(interaction: CommandInteraction): Promise<void> {
        const randomBuild = await database.rand();

        if (!randomBuild) {
            interaction.reply("...Couldn't find anything");
            return;
        }

        const url = new URL(`${randomBuild?.link}`);

        const loadout = await DIM.getBuild(url);

        if (loadout === null) {
            interaction.reply("I couldn't find the loadout link");
            return;
        }

        //parse the build
        const build = new DestinyBuild(loadout, randomBuild.link, {
            author: randomBuild.author,
            rating: randomBuild.rating,
            description: randomBuild.description,
        });

        console.log(build);

        interaction.reply({ embeds: [BuildDiscordEmbed.getEmbed(randomBuild.id, build)] });
    }
}
