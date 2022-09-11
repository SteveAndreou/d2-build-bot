import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption, Guard } from 'discordx';
import { EmbedBuilder } from 'discord.js';
import { database } from '../main.js';
import { Pagination, PaginationResolver, PaginationType } from '@discordx/pagination';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
export class FindBuild {
    @Slash({
        name: 'find',
        description: 'Find a build to play',
    })
    @Guard(RateLimit(TIME_UNIT.seconds, 30))
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
            const { data, totalPages } = await database.search({ guardian, subclass }, currentPage);

            const embed = new EmbedBuilder().setTitle(`${guardian} - ${subclass}`);

            data?.forEach((build) => {
                embed.addFields({
                    name: `[${build.id}] ${build.name} (${build.rating} votes)`,
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
}
