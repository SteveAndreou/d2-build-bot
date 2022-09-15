import { ItemDefinition } from './bungie';
import {
    Loadout,
    EquipmentItem,
    ModItem,
    ClassSocketItem,
    ClassTypes,
    Dictionary,
    DamageTypes,
    BuildMetadata,
} from '../types.js';
import { bungie } from '../main.js';
import groupBy from 'lodash.groupby';
export class DestinyBuild {
    private _loadout: Loadout;

    //general
    author: string;
    rating: number;
    description: string;
    link: string;
    name: string;
    guardianClass: string;
    subClass: string;
    subClassIcon: string;
    damageType: string;

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

    mods: Dictionary<Array<ModItem>>;

    exotic_weapon: EquipmentItem | null;
    exotic_armour: EquipmentItem | null;

    constructor(loadout: Loadout, link: string, metadata: BuildMetadata) {
        this._loadout = loadout;

        this.author = metadata.author;
        this.rating = metadata.rating;
        this.description = metadata.description;

        this.name = loadout.name;
        this.guardianClass = ClassTypes[loadout.classType];
        this.subClass = '';
        this.subClassIcon = '';
        this.damageType = '';
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

        this.exotic_armour = null;
        this.exotic_weapon = null;

        this.mods = {};
    }

    public async process() {
        const { equipped, parameters } = this._loadout;
        const { mods } = parameters;

        const classSocketItems: Array<ClassSocketItem> = [];

        const guardianClass = equipped.find((x) => x.socketOverrides !== undefined);
        const subclass = guardianClass?.hash ? await bungie.getItem(guardianClass.hash) : null;

        this.subClass = `${subclass?.displayProperties.name}`;
        this.damageType = DamageTypes[subclass?.talentGrid.hudDamageType ?? 0];
        this.subClassIcon = `${subclass?.displayProperties.icon}`;

        const sockets = guardianClass?.socketOverrides;
        if (sockets) {
            const hashes = Object.values(sockets);
            const classItems = await bungie.getItems(hashes);

            if (classItems) {
                classSocketItems.push(
                    ...classItems.map((item) => ({
                        name: item.displayProperties.name,
                        icon: item.displayProperties.icon,
                        type: item.itemTypeDisplayName,
                    }))
                );
            }
        }

        const equippedHashes = equipped.filter((x) => x.socketOverrides === undefined).map((x) => x.hash);
        const equippedItems = await bungie.getItems(equippedHashes);
        const equippedSlotHashes = equippedItems ? equippedItems?.map((x) => x.inventory.bucketTypeHash) : [];
        const slots = await bungie.getBuckets(equippedSlotHashes);

        const items = equippedItems
            ? equippedItems?.map(
                  (x) =>
                      ({
                          name: x?.displayProperties.name,
                          icon: x?.displayProperties.icon,
                          type: x?.itemTypeDisplayName,
                          rarity: x?.inventory.tierTypeName,
                          slot:
                              slots?.find((slot) => slot.hash === x.inventory.bucketTypeHash)?.displayProperties.name ??
                              '',
                      } as EquipmentItem)
              )
            : [];

        const modItems = await bungie.getItems(mods);

        this.mods = modItems
            ? groupBy(
                  modItems.map(
                      (x) =>
                          ({
                              name: x?.displayProperties.name,
                              icon: x?.displayProperties.icon,
                              type: x?.itemTypeDisplayName,
                          } as ModItem)
                  ),
                  (x) => x.type
              )
            : {};

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

        const exotics = items.filter((x) => x.rarity === 'Exotic');
        this.exotic_weapon = exotics.find((x) => x.slot.includes('Weapons')) ?? null;
        this.exotic_armour = exotics.find((x) => !x.slot.includes('Weapons')) ?? null;
    }
}
