import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import { Discord, Slash, SlashOption, ButtonComponent, Guard } from 'discordx';
import { database } from '../main.js';
import { DIM } from '../destiny/dim.js';
import { DestinyBuild } from '../destiny/build.js';
import { BuildDiscordEmbed } from '../helpers/embeds.js';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
export class GetBuild {
    @Slash({
        name: 'get',
        description: 'Get a build by ID',
    })
    @Guard(RateLimit(TIME_UNIT.seconds, 30))
    async findBuild(
        @SlashOption({ description: 'ID value for the build', name: 'id' })
        id: number,
        interaction: CommandInteraction
    ): Promise<void> {
        const result = await database.get(id);

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
        const id = interaction.customId.split('-')[1];
        const { tag } = interaction.user;

        const ok = await database.upvote(Number(id), tag);
        interaction.reply({
            content: ok ? 'Your upvote has been logged!' : 'Something went wrong...',
            ephemeral: true,
        });
    }
}
