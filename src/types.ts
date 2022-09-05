export type Builds = {
    id: string;
    link: string;
    created_at: string;
    class: string;
    subclass: string;
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

export type InventoryBucketDefinitions = {
    displayProperties: { name: string; description: string; icon: string };
    hash: number;
};

export interface SocketOverrides {
    1: { id: string; hash: number };
    2: { id: string; hash: number };
    3: { id: string; hash: number };
    4: { id: string; hash: number };
    5: { id: string; hash: number };
    6: { id: string; hash: number };
    7: { id: string; hash: number };
    8: { id: string; hash: number };
    9: { id: string; hash: number };
    10: { id: string; hash: number };
}

export interface Equipped {
    id: string;
    hash: number;
    socketOverrides: Record<string, number>;
}

export interface Parameters {
    mods: number[];
    lockArmorEnergyType: number;
    assumeArmorMasterwork: number;
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
