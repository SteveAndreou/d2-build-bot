import {
    ActionRowBuilder,
    CommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalSubmitInteraction,
} from 'discord.js';
import { Discord, ModalComponent, Slash, Guard } from 'discordx';
import { DestinyBuild } from '../destiny/build.js';
import { DIM } from '../destiny/dim.js';
import { BuildDiscordEmbed } from '../helpers/embeds.js';
import { database } from '../main.js';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
export class AddBuild {
    @Slash({
        name: 'add',
        description: 'Add a build to the build bot',
    })
    @Guard(RateLimit(TIME_UNIT.seconds, 15))
    addBuild(interaction: CommandInteraction): void {
        //as more about the build
        const modal = new ModalBuilder().setTitle(`Add new Build`).setCustomId('BuildCreate');

        const linkInput = new TextInputBuilder()
            .setCustomId('link')
            .setLabel('DIM Link')
            .setPlaceholder('A link to your build')
            .setStyle(TextInputStyle.Short);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Description')
            .setPlaceholder('A short description about the build / components of the build / playstyle of the build')
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(linkInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
        );

        // Present the modal to the user
        interaction.showModal(modal);
    }

    @ModalComponent()
    async BuildCreate(interaction: ModalSubmitInteraction): Promise<void> {
        const user = interaction.user;
        const link = interaction.fields.getTextInputValue('link');
        const description = interaction.fields.getTextInputValue('description');

        await interaction.deferReply();

        if (!link || link.length === 0) {
            await interaction.reply('Did you put a link?');
            return;
        }

        const url = new URL(link);

        const loadout = await DIM.getBuild(url);

        if (loadout === null) {
            interaction.reply("I couldn't find the loadout link");
            return;
        }

        //parse the build
        const build = new DestinyBuild(loadout, link, {
            author: user.tag,
            rating: 0,
            description: description,
        });

        await build.process();

        //Post to database
        let id = await database.exists(link);

        if (id === null) {
            id = await database.create(build);
        }

        // const btn = new ButtonBuilder()
        //     .setEmoji('👍')
        //     .setLabel('Up vote')
        //     .setStyle(ButtonStyle.Success)
        //     .setCustomId(`upvote-${id}`);

        // const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(btn);
        // interaction.reply({ embeds: [BuildDiscordEmbed.getEmbed(id, build)], components: [buttonRow] });
        await interaction.editReply({ embeds: [BuildDiscordEmbed.getEmbed(id, build)] });
    }

    // @ButtonComponent({ id: new RegExp(/upvote-[0-9]+/) })
    // async upvote_handler(interaction: ButtonInteraction): Promise<void> {
    //     const id = interaction.customId.split('-')[1];
    //     const user = interaction.user.tag;

    //     const ok = await database.upvote(Number(id), user);
    //     interaction.reply({
    //         content: ok ? 'Your upvote has been logged!' : 'Something went wrong...',
    //         ephemeral: true,
    //     });
    // }
}
