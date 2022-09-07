import {
    ActionRowBuilder,
    CommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalSubmitInteraction,
    ButtonBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import { Discord, ModalComponent, Slash } from 'discordx';
import { DestinyBuild } from '../destiny/build.js';
import { DIM } from '../destiny/dim.js';
import { BuildDiscordEmbed } from '../helpers/embeds.js';
import { database } from '../main.js';

@Discord()
export class AddBuild {
    @Slash({
        name: 'add',
        description: 'Add a build to the build bot',
    })
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

        //Post to database
        let id = await database.exists(link);

        if (id === null) {
            id = await database.create(build);
        }

        const btn = new ButtonBuilder().setLabel('Up vote').setStyle(ButtonStyle.Success).setCustomId('upvote');
        const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(btn);

        interaction.reply({ embeds: [BuildDiscordEmbed.getEmbed(id, build)], components: [buttonRow] });
    }
}
