import { Build } from './../types.js';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { ButtonStyle, EmbedBuilder } from 'discord.js';
import { supabase } from '../main.js';
import { Pagination, PaginationResolver, PaginationType } from '@discordx/pagination';

type SearchOptions = {
    guardian: string;
    subclass: string;
};

@Discord()
export class FindBuild {
    @Slash({
        name: 'find',
        description: 'Find a build to play',
    })
    async findBuild(
        @SlashChoice(
            { name: 'Titan', value: 'titan' },
            { name: 'Warlock', value: 'warlock' },
            { name: 'Hunter', value: 'hunter' }
        )
        @SlashOption({ name: 'guardian', description: 'Class?' })
        guardian: string,

        @SlashChoice(
            { name: 'Arc', value: 'arc' },
            { name: 'Solar', value: 'solar' },
            { name: 'Void', value: 'void' },
            { name: 'Stasis', value: 'stasis' }
        )
        @SlashOption({ name: 'subclass', description: 'subclass?' })
        subclass: string,

        interaction: CommandInteraction
    ): Promise<void> {
        const getPage = new PaginationResolver(async (page, pagination) => {
            const currentPage = page + 1; //zero index page
            const { data, totalPages } = await this.search({ guardian, subclass }, currentPage);
            console.log({ data, totalPages });

            const embed = new EmbedBuilder().setTitle(`${guardian} - ${subclass}`);

            data?.forEach((build) => {
                embed.addFields({
                    name: `[${build.id}] ${build.name}`,
                    value: `${build.description ?? ''} \u000D ${build.link}`,
                    inline: false,
                });
            });

            embed.setFooter({ text: `Page ${currentPage} / ${totalPages}` });

            pagination.maxLength = totalPages; // new max length for new pagination
            pagination.embeds = [embed]; // page reference can be resolver as well
            return pagination.embeds[pagination.currentPage] ?? 'unknown';
        }, 25);

        const pagination = new Pagination(interaction, getPage, {
            onTimeout: () => interaction.deleteReply(),
            time: 60 * 1000,
            type: PaginationType.Button,
        });

        pagination.send();
    }

    async search(searchOptions: SearchOptions, page: number = 1) {
        const pageSize = 5;
        const start = page * pageSize - pageSize;
        const end = page * pageSize;

        const { data, count, error } = await supabase.database
            .from<Build>('builds')
            .select(
                'id, name, rating, author, link, description, class, subclass, damage, grenade, melee, super, ability, exotic_weapon, exotic_armour',
                { count: 'exact' }
            )
            .ilike('class', searchOptions.guardian)
            .ilike('damage', searchOptions.subclass)
            .range(start, end)
            .limit(pageSize);

        const totalPages = count ? Math.ceil(count / pageSize) : 1;

        return { data, totalPages };
    }
}
