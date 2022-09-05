import {
    ActionRowBuilder,
    CommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalSubmitInteraction,
} from 'discord.js';
import { Discord, ModalComponent, Slash } from 'discordx';
import { DestinyBuild } from '../destiny/build.js';
import { DIM } from '../destiny/dim.js';
import { db } from '../main.js';
import { Builds } from '../types.js';

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
        const link = interaction.fields.getTextInputValue('link');
        const description = interaction.fields.getTextInputValue('description');

        if (!link || link.length === 0) {
            await interaction.reply('Did you put a link?');
            return;
        }

        const url = new URL(link);

        if (url.hostname !== 'dim.gg') {
            await interaction.reply('I dont recognise that URL');
            return;
        }

        const loadout = await DIM.getBuild(url);

        if (loadout === null) {
            interaction.reply("I couldn't find the loadout link");
            return;
        }

        //parse the build
        const build = new DestinyBuild(loadout, link, description);

        //Post to database
        const existing = await db.from<Builds>('builds').select('link').eq('link', link);

        if (existing.data && existing.data.length === 0) {
            const update = await db
                .from<Builds>('builds')
                .insert([{ link: link, class: build.guardianClass, subclass: build.subClass }], {
                    returning: 'minimal',
                });
            console.log(update);
        }

        const embed = build.buildDiscordResponse();
        interaction.reply({ embeds: [embed] });
    }
}
