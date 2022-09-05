export type ItemDefinition = {
    displayProperties: { name: string; description: string; icon: string };
    hash: number;
    itemTypeDisplayName: string;
    itemTypeAndTierDisplayName: string;
    inventory: {
        tierTypeName: string;
        bucketTypeHash: number;
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
            .then((response) => response.Response.jsonWorldContentPaths.en);

        const englishContent = await fetch(`https://bungie.net${englishManifestLocation}`).then((response) =>
            response.json()
        );

        const { DestinyInventoryItemDefinition, DestinyInventoryBucketDefinition } = englishContent;

        this.itemDefinitions = new Map<string, ItemDefinition>(Object.entries(DestinyInventoryItemDefinition));
        this.bucketDefinitions = new Map<string, ItemDefinition>(Object.entries(DestinyInventoryBucketDefinition));
    }
}

export default Bungie;
