import { Loadout } from '../types.js';
import { load } from 'cheerio';
import fetch from 'node-fetch';

export class DIM {
    constructor() {}

    static async getBuild(buildURL: URL): Promise<Loadout | null> {
        if (buildURL.hostname !== 'dim.gg') {
            return null;
        }

        const response = await fetch(buildURL.toString());
        const body = await response.text();

        const $ = load(body);

        const encodedLoadout = $('.dim-button:first').attr('href');

        if (!encodedLoadout) {
            return null;
        }

        const encodedLoadoutUrl = new URL(encodedLoadout);
        const encodedLoadoutString = encodedLoadoutUrl.searchParams.get('loadout');

        if (!encodedLoadoutString) {
            return null;
        }

        const parsedLoadout = JSON.parse(decodeURIComponent(encodedLoadoutString)) as Loadout;

        return parsedLoadout;
    }
}
