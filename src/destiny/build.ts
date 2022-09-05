import { Loadout, EquipmentItem, ModItem, ClassSocketItem, ClassTypes } from '../types.js';
import { bungie } from '../main.js';
import { EmbedBuilder } from 'discord.js';

export class DestinyBuild {
    private _loadout: Loadout;

    //general
    description: string;
    link: string;
    name: string;
    guardianClass: string;
    subClass: string;
    subClassIcon: string;

    //class
    melee: ClassSocketItem | null;
    grenade: ClassSocketItem | null;
    superAbility: ClassSocketItem | null;
    movementAbility: ClassSocketItem | null;
    classAbility: ClassSocketItem | null;
    aspects: Array<ClassSocketItem> | null;
    fragments: Array<ClassSocketItem> | null;

    //weapons
    kinetic: EquipmentItem | null;
    energy: EquipmentItem | null;
    power: EquipmentItem | null;

    //armour
    helm: EquipmentItem | null;
    guantlet: EquipmentItem | null;
    chest: EquipmentItem | null;
    leg: EquipmentItem | null;
    classItem: EquipmentItem | null;

    mods: Array<ModItem> | null;

    constructor(loadout: Loadout, link: string, description: string) {
        this._loadout = loadout;

        this.name = loadout.name;
        this.guardianClass = ClassTypes[loadout.classType];
        this.subClass = '';
        this.subClassIcon = '';
        this.description = description;
        this.link = link;

        this.melee = null;
        this.grenade = null;
        this.superAbility = null;
        this.movementAbility = null;
        this.classAbility = null;
        this.aspects = null;
        this.fragments = null;

        this.kinetic = null;
        this.energy = null;
        this.power = null;

        this.helm = null;
        this.guantlet = null;
        this.chest = null;
        this.leg = null;
        this.classItem = null;

        this.mods = null;

        this.processLoadout();
    }

    private processLoadout() {
        const { equipped, parameters } = this._loadout;
        const { mods } = parameters;

        const classSocketItems: Array<ClassSocketItem> = [];

        const guardianClass = equipped.find((x) => x.socketOverrides !== undefined);
        const subclass = bungie.itemDefinitions.get(`${guardianClass?.hash}`);
        this.subClass = `${subclass?.displayProperties.name}`;
        this.subClassIcon = `${subclass?.displayProperties.icon}`;

        const sockets = guardianClass?.socketOverrides;
        for (const key in sockets) {
            const item = bungie.itemDefinitions.get(`${sockets[key]}`);
            if (item) {
                classSocketItems.push({
                    name: item?.displayProperties.name,
                    icon: item?.displayProperties.icon,
                    type: item?.itemTypeDisplayName,
                });
            }
        }

        let items = equipped
            .filter((x) => x.socketOverrides === undefined)
            .map((x) => bungie.itemDefinitions.get(`${x.hash}`))
            .map(
                (x) =>
                    ({
                        name: x?.displayProperties.name,
                        icon: x?.displayProperties.icon,
                        type: x?.itemTypeDisplayName,
                        rarity: x?.inventory.tierTypeName,
                        slot: `${
                            bungie.bucketDefinitions.get(`${x?.inventory.bucketTypeHash}`)?.displayProperties?.name ??
                            ''
                        }`,
                    } as EquipmentItem)
            );

        this.mods = mods
            .map((x) => bungie.itemDefinitions.get(`${x}`))
            .map(
                (x) =>
                    ({
                        name: x?.displayProperties.name,
                        icon: x?.displayProperties.icon,
                        type: x?.itemTypeDisplayName,
                    } as ModItem)
            );

        this.melee = classSocketItems.find((x) => x.type.includes('Melee')) ?? null;
        this.grenade = classSocketItems.find((x) => x.type.includes('Grenade')) ?? null;
        this.superAbility = classSocketItems.find((x) => x.type === 'Super Ability') ?? null;
        this.movementAbility = classSocketItems.find((x) => x.type === 'Movement Ability') ?? null;
        this.classAbility = classSocketItems.find((x) => x.type.includes('Class Ability')) ?? null;

        this.aspects = classSocketItems.filter((x) => x.type.includes('Aspect'));
        this.fragments = classSocketItems.filter((x) => x.type.includes('Fragment'));

        this.kinetic = items.find((x) => x.slot === 'Kinetic Weapons') ?? null;
        this.energy = items.find((x) => x.slot === 'Energy Weapons') ?? null;
        this.power = items.find((x) => x.slot === 'Power Weapons') ?? null;

        this.helm = items.find((x) => x.type === 'Helmet') ?? null;
        this.guantlet = items.find((x) => x.type === 'Gauntlets') ?? null;
        this.chest = items.find((x) => x.type === 'Chest Armor') ?? null;
        this.leg = items.find((x) => x.type === 'Leg Armor') ?? null;
        this.classItem =
            items.find(
                (x) => x.type?.startsWith('Hunter') || x.type?.startsWith('Warlock') || x.type?.startsWith('Titan')
            ) ?? null;
    }
}
