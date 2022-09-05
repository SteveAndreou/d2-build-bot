import { Builds } from './../types.js';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { supabase } from '../main.js';
import { DestinyBuild } from '../destiny/build.js';
import { DIM } from '../destiny/dim.js';
import { BuildDiscordEmbed } from '../helpers/embeds.js';

@Discord()
export class FindBuild {
    @Slash({
        name: 'find',
        description: 'Find a build to play',
    })
    async findBuild(
        @SlashChoice(
            { name: 'Titan', value: 'titan' },
            { name: 'Warlock', value: 'warlock' },
            { name: 'Hunter', value: 'hunter' }
        )
        @SlashOption({ name: 'guardian', description: 'Class?' })
        guardian: string,

        @SlashChoice(
            { name: 'Arc', value: 'arc' },
            { name: 'Solar', value: 'solar' },
            { name: 'Void', value: 'void' },
            { name: 'Stasis', value: 'stasis' }
        )
        @SlashOption({ name: 'subclass', description: 'subclass?' })
        subclass: string,

        interaction: CommandInteraction
    ): Promise<void> {
        // const lwrGuardian = guardian.toLowerCase();
        // const lwrSubclass = subclass.toLowerCase();

        // if (!['titan', 'warlock', 'hunter'].includes(lwrGuardian)) {
        //     interaction.reply(`I don't know about ${guardian}...`);
        //     return;
        // }

        // if (!['solar', 'arc', 'void', 'stasis'].includes(lwrSubclass)) {
        //     interaction.reply(`I don't know about ${subclass}...`);
        //     return;
        // }

        const result = await this.find(guardian, subclass);

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

    async find(guardian: string, subclass: string) {
        const builds = await supabase.database
            .from<Builds>('random_build')
            .select(
                'id, link, description, class, subclass, damage, grenade, melee, super, ability, exotic_weapon, exotic_armour'
            )
            .ilike('class', guardian)
            .ilike('damage', subclass)
            .limit(1)
            .single();

        return builds.data;
    }
}
