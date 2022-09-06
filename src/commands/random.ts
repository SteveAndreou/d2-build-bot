import { Build } from './../types.js';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { supabase } from '../main.js';
import { DestinyBuild } from '../destiny/build.js';
import { DIM } from '../destiny/dim.js';
import { BuildDiscordEmbed } from '../helpers/embeds.js';

@Discord()
export class RandomBuild {
    @Slash({
        name: 'random',
        description: 'Random a build to play',
    })
    async randomBuild(interaction: CommandInteraction): Promise<void> {
        const randomBuild = await this.rand();

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

        interaction.reply({ embeds: [BuildDiscordEmbed.getEmbed(randomBuild.id, build)] });
    }

    async rand() {
        const randomItem = await supabase.database
            .from<Build>('random_builds')
            .select('id, link, author, rating, description')
            .limit(1)
            .single();
        return randomItem.data;
    }
}
