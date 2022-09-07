import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption, Guard } from 'discordx';
import { EmbedBuilder } from 'discord.js';
import { database } from '../main.js';
import { Pagination, PaginationResolver, PaginationType } from '@discordx/pagination';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
export class MyBuild {
    @Slash({
        name: 'mine',
        description: 'Find my builds',
    })
    @Guard(RateLimit(TIME_UNIT.seconds, 30))
    async myBuilds(interaction: CommandInteraction): Promise<void> {
        const author = interaction.user.tag;

        const getPage = new PaginationResolver(async (page, pagination) => {
            const currentPage = page + 1; //zero index page
            const { data, totalPages } = await database.mine(author, currentPage);

            const embed = new EmbedBuilder().setTitle(`${author}'s Builds`);

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
            return pagination.embeds[pagination.currentPage] ?? 'None!';
        }, 25);

        const pagination = new Pagination(interaction, getPage, {
            onTimeout: () => interaction.deleteReply(),
            time: 60 * 1000,
            type: PaginationType.Button,
        });

        pagination.send();
    }
}
