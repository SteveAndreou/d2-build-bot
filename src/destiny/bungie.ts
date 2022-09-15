import { Bucket, DamageTypes, Item } from '../types.js';
import fetch from 'node-fetch';
import { database } from '../main.js';

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

export type InventoryBucketDefinition = {
    displayProperties: { name: string; description: string; icon: string };
    hash: number;
};

export class Bungie {
    constructor() {}

    public async getItem(hash: number): Promise<ItemDefinition | null> {
        const item = await database.item(hash);

        if (!item) return null;

        try {
            return JSON.parse(item.source) as ItemDefinition;
        } catch (ex) {
            return null;
        }
    }

    public async getItems(hashes: Array<number>): Promise<Array<ItemDefinition> | null> {
        const items = await database.items(hashes);

        if (!items) return null;

        try {
            return items.map((item) => JSON.parse(item.source) as ItemDefinition);
        } catch (ex) {
            return null;
        }
    }

    public async getBucket(hash: number): Promise<InventoryBucketDefinition | null> {
        const bucket = await database.bucket(hash);

        if (!bucket) return null;

        try {
            return JSON.parse(bucket.source) as InventoryBucketDefinition;
        } catch (ex) {
            return null;
        }
    }

    public async getBuckets(hashes: Array<number>): Promise<Array<InventoryBucketDefinition> | null> {
        const buckets = await database.buckets(hashes);

        if (!buckets) return null;

        try {
            return buckets.map((item) => JSON.parse(item.source) as InventoryBucketDefinition);
        } catch (ex) {
            return null;
        }
    }
}

export default Bungie;
