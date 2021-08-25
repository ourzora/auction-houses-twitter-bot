import {fetchLatestUpdateStrings} from './zora-indexer-queries.js';

console.log(await fetchLatestUpdateStrings((new Date().getTime()/1000) - 60*5*60))