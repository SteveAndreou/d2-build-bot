import { EmbedBuilder } from '@discordjs/builders';
import { DestinyBuild } from '../destiny/build.js';

export class BuildDiscordEmbed {
    constructor() {}

    static getEmbed(id: string | number, build: DestinyBuild) {
        const buildEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(build.name)
            .setURL(build.link)
            .setDescription(`[${id}] ${build.guardianClass} - ${build.subClass} \u000D ${build.description} \u000D`)
            .setThumbnail(`https://www.bungie.net${build.subClassIcon}`);

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
            console.log("Couldn't build abilities");
        }

        try {
            const fragmentsString = build.fragments?.map((a) => `${a?.name ?? 'Empty'}`).join('\u000D') ?? 'None';
            buildEmbed.addFields({ name: `Fragments`, value: fragmentsString, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Fragments`, value: 'None', inline: true });
            console.log("Couldn't build Fragments");
        }

        try {
            let weaponString = `${build.kinetic?.name ?? 'Empty'} \u000D`;
            weaponString += `${build.energy?.name ?? 'Empty'} \u000D`;
            weaponString += `${build.power?.name ?? 'Empty'} \u000D`;

            buildEmbed.addFields({ name: `Weapons`, value: weaponString, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Weapons`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
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
            console.log("Couldn't build abilities");
        }

        try {
            const helm =
                build.mods
                    ?.filter((x) => x?.type?.includes('Helmet'))
                    .map((a) => `${a?.name}`)
                    .join('\u000D') ?? 'None';

            buildEmbed.addFields({ name: `Helmet Armor Mod`, value: helm, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Helmet Armor Mod`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
        }

        try {
            const chest =
                build.mods
                    ?.filter((x) => x?.type?.includes('Chest'))
                    .map((a) => `${a?.name}`)
                    .join('\u000D') ?? 'None';

            buildEmbed.addFields({ name: `Chest Armor Mod`, value: chest, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Chest Armor Mod`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
        }

        try {
            const leg =
                build.mods
                    ?.filter((x) => x?.type?.includes('Leg'))
                    .map((a) => `${a?.name}`)
                    .join('\u000D') ?? 'None';

            buildEmbed.addFields({ name: `Legs Armor Mod`, value: leg, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Legs Armor Mod`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
        }

        try {
            const general =
                build.mods
                    ?.filter((x) => x?.type?.includes('General'))
                    .map((a) => `${a?.name}`)
                    .join('\u000D') ?? 'None';

            buildEmbed.addFields({ name: `General Mod`, value: general, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `General Mod`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
        }

        try {
            const elemental =
                build.mods
                    ?.filter((x) => x?.type?.includes('Elemental'))
                    .map((a) => `${a?.name}`)
                    .join('\u000D') ?? 'None';

            buildEmbed.addFields({ name: `Elemental Mod`, value: elemental, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Elemental Mod`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
        }

        try {
            const classmods =
                build.mods
                    ?.filter((x) => x?.type?.includes('Class'))
                    .map((a) => `${a?.name}`)
                    .join('\u000D') ?? 'None';

            buildEmbed.addFields({ name: `Class Mod`, value: classmods, inline: true });
        } catch (ex) {
            buildEmbed.addFields({ name: `Class Mod`, value: 'None', inline: true });
            console.log("Couldn't build abilities");
        }

        buildEmbed.setTimestamp().setFooter({ text: 'Destiny 2 Build Bot' });

        return buildEmbed;
    }
}
