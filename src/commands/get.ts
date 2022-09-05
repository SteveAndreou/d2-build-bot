import { Builds } from '../types.js';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { supabase } from '../main.js';
import { DIM } from '../destiny/dim.js';
import { DestinyBuild } from '../destiny/build.js';
import { BuildDiscordEmbed } from '../helpers/embeds.js';

@Discord()
export class GetBuild {
    @Slash({
        name: 'get',
        description: 'Get a build by ID',
    })
    async findBuild(
        @SlashOption({ description: 'ID value for the build', name: 'id' })
        id: string,
        interaction: CommandInteraction
    ): Promise<void> {
        const result = await this.get(id);

        if (!result) {
            interaction.reply("...Couldn't find anything");
            return;
        }

        const url = new URL(`${result?.link}`);

        const loadout = await DIM.getBuild(url);

        if (loadout === null) {
            interaction.reply("I couldn't find the loadout link");
            return;
        }

        //parse the build
        const build = new DestinyBuild(loadout, result.link, result.description);

        interaction.reply({ embeds: [BuildDiscordEmbed.getEmbed(result.id, build)] });
    }

    async get(id: string) {
        const { data } = await supabase.database
            .from<Builds>('builds')
            .select(
                'id, link, description, class, subclass, damage, grenade, melee, super, ability, exotic_weapon, exotic_armour'
            )
            .filter('id', 'eq', id)
            .limit(1)
            .single();

        return data;
    }
}
