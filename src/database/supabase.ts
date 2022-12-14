import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DestinyBuild } from '../destiny/build';
import { Bucket, Build, Rating, SearchOptions, Item } from '../types';

export class Supabase {
    database: SupabaseClient;

    constructor() {
        this.database = createClient(`${process.env.SUPABASE_URL}`, `${process.env.SUPABASE_KEY}`);
    }

    async bucket(hash: number): Promise<Bucket | null> {
        const { data, error } = await this.database
            .from<Bucket>('buckets')
            .select('id, hash, created_at, source, name')
            .eq('hash', hash)
            .limit(1)
            .single();

        return data;
    }

    async buckets(hash: Array<number>): Promise<Array<Bucket> | null> {
        const { data, error } = await this.database
            .from<Bucket>('buckets')
            .select('id, hash, created_at, source, name')
            .in('hash', hash);

        return data;
    }

    async item(hash: number): Promise<Item | null> {
        const { data, error } = await this.database
            .from<Bucket>('items')
            .select('id, hash, created_at, source, name')
            .eq('hash', hash)
            .limit(1)
            .single();

        return data;
    }

    async items(hash: Array<number>): Promise<Array<Item> | null> {
        const { data, error } = await this.database
            .from<Bucket>('items')
            .select('id, hash, created_at, source, name')
            .in('hash', hash);

        return data;
    }

    async exists(link: string): Promise<Build['id'] | null> {
        const { data } = await this.database
            .from<Build>('builds')
            .select('id, link')
            .eq('link', link)
            .limit(1)
            .single();

        return data?.id ?? null;
    }

    async create(build: DestinyBuild) {
        const { data, error } = await this.database
            .from<Build>('builds')
            .insert([
                {
                    name: build.name,
                    author: build.author,
                    rating: 0,
                    link: build.link,
                    class: build.guardianClass,
                    description: build.description,
                    subclass: build.subClass,
                    damage: build.damageType,
                    grenade: build.grenade?.name ?? null,
                    melee: build.melee?.name ?? null,
                    ability: build.classAbility?.name ?? null,
                    super: build.superAbility?.name ?? null,
                    exotic_weapon: build.exotic_weapon?.name,
                    exotic_armour: build.exotic_armour?.name,
                },
            ])
            .single();

        if (error) return null;
        if (data === null) return null;

        return data.id;
    }

    async upvote(id: number, user: string): Promise<boolean> {
        //check to see if already voted
        console.log(`upvote ${id} for ${user}`);
        const { error, count } = await this.database
            .from<Rating>('ratings')
            .select('build_id', { count: 'exact' })
            .eq('build_id', id)
            .eq('user', user);

        if (count === null) return false;
        if (count > 0) return false;

        // insert a new vote
        console.log('new entry', { build_id: id, user: user });

        const { data: vote, error: voteError } = await this.database
            .from<Rating>('ratings')
            .insert([{ build_id: id, user: user }])
            .single();

        if (voteError) return false;

        // update ratings count on build
        const { data } = await this.database.from<Build>('builds').select('id, rating').eq('id', id).limit(1).single();
        const currentRating = data?.rating ?? 0;

        const { status } = await this.database
            .from<Build>('builds')
            .update({ rating: currentRating + 1 })
            .eq('id', id);

        return status === 200;
    }

    async get(id: number) {
        const { data } = await this.database
            .from<Build>('builds')
            .select(
                'id, link, rating, author, description, class, subclass, damage, grenade, melee, super, ability, exotic_weapon, exotic_armour'
            )
            .filter('id', 'eq', id)
            .limit(1)
            .single();

        return data;
    }

    async rand() {
        const { data, error, status } = await this.database
            .from<Build>('random_builds')
            .select('id, link, author, rating, description')
            .limit(1)
            .single();

        return data;
    }

    async search(searchOptions: SearchOptions, page: number = 1) {
        const pageSize = 5;
        const start = page * pageSize - pageSize;
        const end = page * pageSize;

        const { data, count, error } = await this.database
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

    async mine(author: string, page: number = 1) {
        const pageSize = 5;
        const start = page * pageSize - pageSize;
        const end = page * pageSize;

        const { data, count, error } = await this.database
            .from<Build>('builds')
            .select(
                'id, name, rating, author, link, description, class, subclass, damage, grenade, melee, super, ability, exotic_weapon, exotic_armour',
                { count: 'exact' }
            )
            .ilike('author', author)
            .range(start, end)
            .limit(pageSize);

        const totalPages = count ? Math.ceil(count / pageSize) : 1;

        console.log({ data, count, error });
        return { data, totalPages };
    }

    async delete(id: number, tag: string) {
        const build = await this.get(id);

        if (build === null) return false;

        if (build.author === tag) {
            const { status } = await this.database.from<Build>('builds').delete().match({ id: build.id });

            return status === 200;
        }

        return false;
    }
}
