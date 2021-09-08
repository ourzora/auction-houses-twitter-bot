import graph from "graphql.js";
import Big from "big.js";
import Config from "./auction-houses-config.js";

const server = graph(
  process.env.INDEXER_ENDPOINT ||
    "https://indexer-prod-mainnet.zora.co/v1/graphql",
  { asJSON: true }
);

const infoQuery = server.query(
  `
  query($contracts:[String!], $startTime: timestamp!) {
    AuctionBidEvent(where:{
      tokenContract:{_in: $contracts}
      blockTimestamp:{_gt: $startTime}
    }) {
      tokenId
      tokenContract
      address
      value
      transactionHash
      blockTimestamp
      transaction {
        from
      }
    }
    AuctionCreatedEvent(where:{
      tokenContract:{_in: $contracts}
      blockTimestamp:{_gt: $startTime}
    }) {
      tokenId
      tokenContract
      address
      blockTimestamp
      auction {
        reservePrice
      }
      transaction {
        from
      }
    }
    AuctionReservePriceUpdatedEvent(where:{
      tokenContract:{_in:$contracts}
      blockTimestamp:{_gt: $startTime}
    }) {
      tokenId
      address
      tokenContract
      blockTimestamp
      auction {
        reservePrice
      }
      transaction {
        from
      }
    }
  }
`
);

function formatEther(rawValue) {
  return Big(rawValue).div(Big(10).pow(18)).toFixed(2);
}

function getCollection(collectionAddress) {
  return Config.find(
    (collectionConfig) => collectionConfig.collection === collectionAddress
  );
}

export async function fetchLatestUpdateStrings(startTimestamp) {
  const contracts = Config.map(
    (collectionConfig) => collectionConfig.collection
  );
  const startTime = new Date(Math.floor(startTimestamp*1000)).toISOString();
  console.log(startTimestamp)
  const incrementalUpdates = await fetchIncremetalUpdates({
    contracts,
    startTime,
  });
  return getUpdateStrings(incrementalUpdates);
}

export function getUpdateStrings(incrementalUpdates) {
  const bidEvents = incrementalUpdates.AuctionBidEvent.map((bidEvent) => {
    const collection = getCollection(bidEvent.tokenContract);
    return {
      tm: bidEvent.blockTimestamp,
      text: `🤑  ${formatEther(bidEvent.value)} Ξ bid on ${
        collection.tokenName
      }${bidEvent.tokenId} placed by ${
        bidEvent.transaction.from
      }  🔗 ${collection.urlTemplate.replace("{id}", bidEvent.tokenId)}`,
    };
  });
  const createdEvents = incrementalUpdates.AuctionCreatedEvent.map(
    (createdEvent) => {
      const collection = getCollection(createdEvent.tokenContract);
      return {
        tm: createdEvent.blockTimestamp,
        text: `🆕 ${collection.tokenName}${createdEvent.tokenId} listed on ${
          collection.name
        } with a reserve of ${formatEther(
          createdEvent.auction.reservePrice
        )} Ξ by ${createdEvent.transaction.from}  🔗 ${collection.urlTemplate.replace(
          "{id}",
          createdEvent.tokenId
        )}`,
      };
    }
  );
  const updatedEvents = incrementalUpdates.AuctionReservePriceUpdatedEvent.map(
    (updatedEvent) => {
      const collection = getCollection(updatedEvent.tokenContract);
      return {
        tm: updatedEvent.blockTimestamp,
        text: `💰 ${
          collection.tokenName
        }${updatedEvent.tokenId} reserve price updated to ${formatEther(
          updatedEvent.auction.reservePrice
        )} Ξ by ${updatedEvent.transaction.from}  🔗 ${collection.urlTemplate.replace(
          "{id}",
          updatedEvent.tokenId
        )}`,
      };
    }
  );
  return [...bidEvents, ...updatedEvents, ...createdEvents].sort((a, b) =>
    new Date(a.tm) < new Date(b.tm) ? -1 : 1
  );
}

export async function fetchIncremetalUpdates({ contracts, startTime }) {
  return await infoQuery({ contracts, startTime });
}
