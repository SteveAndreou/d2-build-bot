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
import { BuildDiscordEmbed } from '../helpers/embeds.js';
import { supabase } from '../main.js';
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

        const loadout = await DIM.getBuild(url);

        if (loadout === null) {
            interaction.reply("I couldn't find the loadout link");
            return;
        }

        //parse the build
        const build = new DestinyBuild(loadout, link, description);

        //Post to database
        const { data, status } = await supabase.database.from<Builds>('builds').select('id, link').eq('link', link);

        let id = '??';
        if (status === 200 && data) {
            //grab the id from existing entry
            if (data.length > 0) {
                id = data[0].id;
            }

            // create new entry
            if (data.length === 0) {
                const newEntry = await supabase.database.from<Builds>('builds').insert([
                    {
                        name: build.name,
                        link: link,
                        class: build.guardianClass,
                        description: build.description,
                        subclass: build.subClass,
                        damage: build.damageType,
                        grenade: build.grenade?.name ?? null,
                        melee: build.melee?.name ?? null,
                        ability: build.classAbility?.name ?? null,
                        super: build.superAbility?.name ?? null,
                        exotic_weapon: build.exotic_weapon?.name,
                        exotic_armour: build.exotic_armour?.name,
                    },
                ]);
            }
        }

        interaction.reply({ embeds: [BuildDiscordEmbed.getEmbed(id, build)] });
    }
}
