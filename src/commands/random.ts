import { Builds } from './../types.js';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { supabase } from '../main.js';

@Discord()
export class RandomBuild {
    @Slash({
        name: 'random',
        description: 'Random a build to play',
    })
    async randomBuild(interaction: CommandInteraction): Promise<void> {
        const result = await this.rand();
        interaction.reply('hmmm...');
    }

    async rand() {
        let output = '';
        // const randomItem = await supabase.database
        //     .from<Builds>('builds')
        //     .select('count(*) AS ct, min(id) AS min_id, max(id) AS max_id, max(id) - min(id) AS id_span');

        //console.log(randomItem);

        return output;
    }
}
