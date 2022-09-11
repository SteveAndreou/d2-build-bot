import { DamageTypes } from '../types';
import fetch from 'node-fetch';

export type ItemDefinition = {
    displayProperties: { name: string; description: string; icon: string };
    hash: number;
    itemTypeDisplayName: string;
    itemTypeAndTierDisplayName: string;
    inventory: {
        tierTypeName: string;
        bucketTypeHash: number;
    };
    talentGrid: {
        hudDamageType: DamageTypes;
    };
};

export type InventoryBucketDefinitions = {
    displayProperties: { name: string; description: string; icon: string };
    hash: number;
};

export class Bungie {
    itemDefinitions = new Map<string, ItemDefinition>();
    bucketDefinitions = new Map<string, InventoryBucketDefinitions>();

    constructor() {}

    async getManifest() {
        const englishManifestLocation = await fetch('https://bungie.net/Platform/Destiny2/Manifest')
            .then((response) => response.json())
            .then((response) => response as any)
            .then((response) => response.Response.jsonWorldContentPaths.en);

        const englishContent = await fetch(`https://bungie.net${englishManifestLocation}`)
            .then((response) => response.json())
            .then((response) => response as any);

        const DestinyInventoryItemDefinition = englishContent.DestinyInventoryItemDefinition;
        const DestinyInventoryBucketDefinition = englishContent.DestinyInventoryBucketDefinition;

        this.itemDefinitions = new Map<string, ItemDefinition>(Object.entries(DestinyInventoryItemDefinition));
        this.bucketDefinitions = new Map<string, ItemDefinition>(Object.entries(DestinyInventoryBucketDefinition));

        console.log('manifest added');
        console.log(`${this.itemDefinitions.size}`);
    }
}

export default Bungie;
