import * as dotenv from 'dotenv'
import { Client, EmbedBuilder, GatewayIntentBits, REST, Routes } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { load } from 'cheerio';
import { ItemDefinition, InventoryBucketDefinitions, Loadout, ClassTypes, Builds } from './types';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

let itemDefinitions = new Map<string, ItemDefinition>();
let bucketDefinitions = new Map<string, InventoryBucketDefinitions>();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
const db = createClient(`${process.env.SUPABASE_URL}`, `${process.env.SUPABASE_KEY}`);

const pingCommand = new SlashCommandBuilder().setName('ping').setDescription('Check if this interaction is responsive');
const findCommand = new SlashCommandBuilder()
    .setName("find")
    .setDescription("Find a build in the collection")
    .addStringOption((option) => 
        option.setName("class")
            .setDescription("Titan, Warlock or Hunter?")
            .addChoices(
                { name: 'Titan', value: "Titan"},
                { name: 'Warlock', value: "Warlock"},
                { name: 'Hunter', value: "Hunter"}
            )
    );

const registerCommand = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds a new build')
    .addStringOption((option) =>
        option
            .setName('link')
            .setDescription('DIM Link')
            .setRequired(true),
    );

const pingJSON = pingCommand.toJSON();
const commandJSON = registerCommand.toJSON();
const findJSON = findCommand.toJSON();

const rest = new REST({ version: "10" }).setToken(`${process.env.DISCORD_TOKEN}`);


async function getManifest() {
    const englishManifestLocation = await fetch(
        "https://bungie.net/Platform/Destiny2/Manifest"
      )
        .then((response) => response.json())
        .then((response) => response.Response.jsonWorldContentPaths.en);
    
      console.warn("----------------------------------------------");
      console.warn("------ Getting BUNGIE.NET Data Manifest ------");
      console.warn("----------------------------------------------");
    
      const englishContent = await fetch(
        `https://bungie.net${englishManifestLocation}`
      ).then((response) => response.json());
    
      const { DestinyInventoryItemDefinition, DestinyInventoryBucketDefinition } = englishContent;

      const items = new Map<string, ItemDefinition>(Object.entries(DestinyInventoryItemDefinition));
      const inventoryBuckets = new Map<string, ItemDefinition>(Object.entries(DestinyInventoryBucketDefinition));
      return { items, inventoryBuckets};
}

(async () => {
    if(itemDefinitions.size === 0) {
        const { items, inventoryBuckets } = await getManifest();
        itemDefinitions = items;
        bucketDefinitions = inventoryBuckets;
    }

    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(`${process.env.DISCORD_APP_ID}`), {
            body: [pingJSON, commandJSON, findJSON],
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();



client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag ?? ''}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === "find") {
     const targetedClass = interaction.options.getString("class");

     const builds = await db.from('builds').select('link, class, subclass').filter('class', 'eq', targetedClass);

     if(builds.data) {
        const buildStr = builds.data.map(x => x.link).join('\u000D');
        await interaction.reply(buildStr);
     }
  }

  if (interaction.commandName === "add") {
    const link = interaction.options.getString("link");

    if(!link) {
        await interaction.reply("Did you put a link?");
        return;
    }

    const url = new URL(link);
    
    if(url.hostname !== 'dim.gg') {
        await interaction.reply("I dont recognise that URL");
        return;
    }

    const response = await fetch(url)
    const body = await response.text();

    const $ = load(body);

    const encodedLoadout = $('.dim-button:first').attr('href');
    
    if(!encodedLoadout) {
        await interaction.reply("I couldn't find the loadout link");
        return;
    }

    const encodedLoadoutUrl = new URL(encodedLoadout);
    const encodedLoadoutString = encodedLoadoutUrl.searchParams.get('loadout');

    if(!encodedLoadoutString) {
        await interaction.reply("I couldn't find the loadout link");
        return;
    }

    const decodedLoadout = decodeURIComponent(encodedLoadoutString);
    const parsedLoadout = JSON.parse(decodedLoadout) as Loadout;
    //get the link
    // parse the data 
    // fuck knows
    const { equipped, name, parameters, classType } = parsedLoadout;
    const { mods } = parameters;
    

    const guardianClass = equipped.find(x => x.socketOverrides !== undefined);
    const subclass = itemDefinitions.get(`${guardianClass?.hash}`)
    
    const classSocketItems: Array<ItemDefinition> = [];
    const sockets = guardianClass?.socketOverrides;
    for(const key in sockets) {
        const item = itemDefinitions.get(`${sockets[key]}`);
        if(item) {
            classSocketItems.push(item);
        }
    }

    let manifestItems = equipped.filter(x => x.socketOverrides === undefined)
        .map(x => itemDefinitions.get(`${x.hash}`));

    const items = manifestItems.map(x => ({
        name: x?.displayProperties.name, 
        icon: x?.displayProperties.icon, 
        type: x?.itemTypeDisplayName,
        rarity: x?.inventory.tierTypeName,
        slot: bucketDefinitions.get(`${x?.inventory.bucketTypeHash}`)?.displayProperties?.name,
    }));
    
    const modders = mods.map(x => itemDefinitions.get(`${x}`))
        .map(x => ({ name: x?.displayProperties.name, icon: x?.displayProperties.icon, type: x?.itemTypeDisplayName}))

    const melee = classSocketItems.find(x => x?.itemTypeDisplayName.includes("Melee"));
    const grenade = classSocketItems.find(x => x?.itemTypeDisplayName.includes("Grenade"));
    const superAbility = classSocketItems.find(x => x?.itemTypeDisplayName === "Super Ability");
    const movementAbility = classSocketItems.find(x => x?.itemTypeDisplayName === "Movement Ability");
    const classAbility = classSocketItems.find(x => x?.itemTypeDisplayName.includes("Class Ability"));

    const aspects = classSocketItems.filter(x => x?.itemTypeDisplayName.includes("Aspect"));
    const fragments = classSocketItems.filter(x => x?.itemTypeDisplayName.includes("Fragment"));
    const aspectsString = aspects.map(a => `${a?.displayProperties.name}`).join('\u000D');
    const fragmentsString = fragments.map(a => `${a?.displayProperties.name}`).join('\u000D');

    const kinetic = items.find(x => x.slot === "Kinetic Weapons");
    const energy = items.find(x => x.slot === "Energy Weapons");
    const power = items.find(x => x.slot === "Power Weapons");
    
    let weaponString = `${kinetic?.name ?? 'Empty'} \u000D`;
    weaponString += `${energy?.name ?? 'Empty'} \u000D`;
    weaponString += `${power?.name ?? 'Empty'} \u000D`;

    let abilitiesString = `${movementAbility?.displayProperties.name} \u000D`;
    abilitiesString += `${melee?.displayProperties.name} \u000D`;
    abilitiesString += `${grenade?.displayProperties.name} \u000D`;
    abilitiesString += `${classAbility?.displayProperties.name} \u000D`;
    abilitiesString += `${superAbility?.displayProperties.name} \u000D`;

    const helmArmour = items.find(x => x.type === "Helmet");
    const handArmour = items.find(x => x.type === "Gauntlets");
    const chestArmour = items.find(x => x.type === "Chest Armor");
    const legArmour = items.find(x => x.type === "Leg Armor");
    const classAmour = items.find(x => x.type?.startsWith("Hunter") || x.type?.startsWith("Warlock") || x.type?.startsWith("Titan"));
    
    let armourString = `${helmArmour?.name ?? 'Empty'} \u000D`;
    armourString += `${handArmour?.name ?? 'Empty'} \u000D`;
    armourString += `${chestArmour?.name ?? 'Empty'} \u000D`;
    armourString += `${legArmour?.name ?? 'Empty'} \u000D`;
    armourString += `${classAmour?.name ?? 'Empty'} \u000D`;

    const helm = modders.filter(x => x?.type?.includes("Helmet")).map(a => `${a?.name}`).join('\u000D');
    const chest = modders.filter(x => x?.type?.includes("Chest")).map(a => `${a?.name}`).join('\u000D');
    const leg = modders.filter(x => x?.type?.includes("Leg")).map(a => `${a?.name}`).join('\u000D');
    const general = modders.filter(x => x?.type?.includes("General")).map(a => `${a?.name}`).join('\u000D');
    const elemental = modders.filter(x => x?.type?.includes("Elemental")).map(a => `${a?.name}`).join('\u000D');
    const classmods = modders.filter(x => x?.type?.includes("Class")).map(a => `${a?.name}`).join('\u000D');

    const guardianClassName = ClassTypes[classType];
    const subclassName = subclass?.displayProperties.name;

    //Post to database
    const existing = await db.from<Builds>('builds').select('link').eq('link', link);
    
    if(existing.data && existing.data.length === 0) {
        const update = await db.from<Builds>('builds').insert([{ link: link, class: guardianClassName, subclass: subclassName}], { returning: 'minimal' })
        console.log(update);
    }

    //Post to discord
    const buildEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle(name)
	.setURL(link)
	.setDescription(`${guardianClassName} - ${subclassName}`)
	.setThumbnail(`https://www.bungie.net${subclass?.displayProperties.icon}`)
    .addFields({ name: `Abilities`, value: abilitiesString, inline: true})
    .addFields({ name: `Aspects`, value: aspectsString, inline: true})
    .addFields({ name: `Fragments`, value: fragmentsString, inline: true})
    .addFields({ name: `Weapons`, value: weaponString, inline: true})
    .addFields({ name: `Armour`, value: armourString, inline: true})
    .addFields({ name: `\u200B`, value: `\u200B`, inline: true})
    .addFields({ name: `Helmet Armor Mod`, value: helm, inline: true})
    .addFields({ name: `Chest Armor Mod`, value: chest, inline: true})
    .addFields({ name: `Legs Armor Mod`, value: leg, inline: true})
    .addFields({ name: `General Mod`, value: general, inline: true})
    .addFields({ name: `Elemental Mod`, value: elemental, inline: true})
    .addFields({ name: `Class Mod`, value: classmods, inline: true})
	.setTimestamp()
	.setFooter({ text: 'Destiny 2 Build Bot' });

    await interaction.reply({ embeds: [ buildEmbed ] });
  }
});

client.login(process.env.DISCORD_TOKEN);