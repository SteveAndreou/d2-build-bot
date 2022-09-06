import { EmbedBuilder } from '@discordjs/builders';
import { DestinyBuild } from '../destiny/build.js';
import groupBy from 'lodash.groupby';
import { CustomEmoji } from './emoji.js';

export class BuildDiscordEmbed {
    constructor() {}

    static getEmbed(id: string | number, build: DestinyBuild) {
        const buildEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(build.name)
            .setURL(build.link)
            .setAuthor({ name: build.author })
            .setDescription(
                `[${id}] ${build.guardianClass} - ${CustomEmoji[`${build.damageType as keyof typeof CustomEmoji}`]} ${
                    build.subClass
                } \u000D ${build.description} \u000D`
            )
            .setThumbnail(`https://www.bungie.net${build.superAbility?.icon}`);

        try {
            let abilitiesString = `${build.movementAbility?.name} \u000D`;
            abilitiesString += `${build.melee?.name} \u000D`;
            abilitiesString += `${build.grenade?.name} \u000D`;
            abilitiesString += `${build.classAbility?.name} \u000D`;
            abilitiesString += `${build.superAbility?.name} \u000D`;

            buildEmbed.addFields({ name: `Abilities`, value: abilitiesString, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Abilities`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
        }

        try {
            const aspectsString = build.aspects?.map((a) => `${a?.name ?? 'Empty'}`).join('\u000D') ?? 'None';
            buildEmbed.addFields({ name: `Aspects`, value: aspectsString, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Aspects`, value: 'None', inline: true });
            console.log("Couldn't build aspects");
        }

        try {
            const fragmentsString = build.fragments?.map((a) => `${a?.name ?? 'Empty'}`).join('\u000D') ?? 'None';
            buildEmbed.addFields({ name: `Fragments`, value: fragmentsString, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Fragments`, value: 'None', inline: true });
            console.log("Couldn't build fragments");
        }

        try {
            let weaponString = `${build.kinetic?.name ?? 'Empty'} \u000D`;
            weaponString += `${build.energy?.name ?? 'Empty'} \u000D`;
            weaponString += `${build.power?.name ?? 'Empty'} \u000D`;

            buildEmbed.addFields({ name: `Weapons`, value: weaponString, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Weapons`, value: 'None', inline: true });
            console.log("Couldn't build weapons");
        }

        try {
            let armourString = `${build.helm?.name ?? 'Empty'} \u000D`;
            armourString += `${build.guantlet?.name ?? 'Empty'} \u000D`;
            armourString += `${build.chest?.name ?? 'Empty'} \u000D`;
            armourString += `${build.leg?.name ?? 'Empty'} \u000D`;
            armourString += `${build.classItem?.name ?? 'Empty'} \u000D`;

            buildEmbed.addFields({ name: `Armour`, value: armourString, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Armour`, value: 'None', inline: true });
            console.log("Couldn't build armour");
        }

        buildEmbed.addFields({ name: `\u200B`, value: `\u200B`, inline: true });

        for (let [key, value] of Object.entries(build.mods)) {
            try {
                const groupedMods = groupBy(value, (x) => x.name);
                const mods =
                    Object.entries(groupedMods)
                        .map(([key, values]) => `${key} ${values.length > 1 ? `x${values.length}` : ``}`)
                        .join('\u000D') ?? 'None';

                buildEmbed.addFields({ name: `${key}s`, value: mods, inline: true });
            } catch (ex) {
                buildEmbed.addFields({ name: `${key}s`, value: 'None', inline: true });
                console.log(`Couldn't build ${key}s`);
            }
        }

        buildEmbed.setTimestamp().setFooter({ text: 'Destiny 2 Build Bot' });

        return buildEmbed;
    }
}
