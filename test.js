import {fetchLatestUpdateStrings} from './zora-indexer-queries.js';

console.log(await fetchLatestUpdateStrings((new Date().getTime()/1000) - 10000*24*60))
