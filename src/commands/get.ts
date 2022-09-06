import { Build } from '../types.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import { Discord, Slash, SlashOption, ButtonComponent } from 'discordx';
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
        const build = new DestinyBuild(loadout, result.link, {
            author: result.author,
            rating: result.rating,
            description: result.description,
        });

        const btn = new ButtonBuilder()
            .setEmoji('👍')
            .setLabel('Up vote')
            .setStyle(ButtonStyle.Success)
            .setCustomId(`upvote-${result.id}`);

        const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(btn);
        interaction.reply({ embeds: [BuildDiscordEmbed.getEmbed(result.id, build)], components: [buttonRow] });
    }

    @ButtonComponent({ id: new RegExp(/upvote-[0-9]+/) })
    async upvote_handler(interaction: ButtonInteraction): Promise<void> {
        console.log(interaction.customId);
        const id = interaction.customId.split('-')[1];

        const ok = await this.upvote(id);
        interaction.reply({
            content: ok ? 'Your upvote has been logged!' : 'Something went wrong...',
            ephemeral: true,
        });
    }

    async upvote(id: string) {
        const { data } = await supabase.database
            .from<Build>('builds')
            .select('id, rating')
            .eq('id', id)
            .limit(1)
            .single();

        const currentRating = data?.rating ?? 0;

        const { status } = await supabase.database
            .from<Build>('builds')
            .update({ rating: currentRating + 1 })
            .eq('id', id);

        return status === 200;
    }

    async get(id: string) {
        const { data } = await supabase.database
            .from<Build>('builds')
            .select(
                'id, link, rating, author, description, class, subclass, damage, grenade, melee, super, ability, exotic_weapon, exotic_armour'
            )
            .filter('id', 'eq', id)
            .limit(1)
            .single();

        return data;
    }
}
