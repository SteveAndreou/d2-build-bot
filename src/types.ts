export type Build = {
    id: string;
    author: string;
    rating: number;
    name: string;
    link: string;
    description: string;
    created_at: string;
    class: string;
    subclass: string;
    damage: string | null;
    grenade: string | null;
    melee: string | null;
    ability: string | null;
    super: string | null;
    exotic_weapon: string | null;
    exotic_armour: string | null;
};

export type BuildMetadata = {
    author: string;
    rating: number;
    description: string;
};

export type EquipmentItem = {
    name: string;
    icon: string;
    type: string;
    rarity: string;
    slot: string;
};

export type ModItem = {
    name: string;
    icon: string;
    type: string;
};

export type ClassSocketItem = {
    name: string;
    icon: string;
    type: string;
};

export enum ClassTypes {
    Titan = 0,
    Hunter = 1,
    Warlock = 2,
}

export enum DamageTypes {
    Kinetic = 1,
    Arc = 2,
    Solar = 3,
    Void = 4,
    Raid = 5,
    Stasis = 6,
}

export type InventoryBucketDefinitions = {
    displayProperties: { name: string; description: string; icon: string };
    hash: number;
};

export interface SocketOverrides {
    [key: number]: { id: string; hash: number };
}

export interface Equipped {
    id: string;
    hash: number;
    socketOverrides: Record<string, number>;
}

export interface Parameters {
    mods: number[];
}

export interface Loadout {
    id: string;
    name: string;
    classType: number;
    clearSpace: boolean;
    equipped: Equipped[];
    createdAt: Date;
    parameters: Parameters;
}

export interface Dictionary<T> {
    [index: string]: T;
}
