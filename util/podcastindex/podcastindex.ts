// This file is a class that interface with the podcastindex api
import dotenv from "dotenv"
dotenv.config({ path: '../.env' });
import crypto from 'crypto';
import { log } from "console";



// getEpisodeByFeedGuidItemGuid('1001e490-9b28-59f1-b120-5aa0866862d7', '30cd825f-66be-41f7-93cd-f84084c7bf48');

export default class PodcastIndex {
  /**
   * Get an episode by its feed guid and item guid.
   * 
   * @param feedGuid The guid of the feed that the episode belongs to
   * @param itemGuid The guid of the item that represents the episode
   * @returns The episode data from the Podcast Index API, or null if not found
   * @throws {Error} If the episode cannot be found
   */
  async getEpisodeByFeedGuidItemGuid(feedGuid: string, itemGuid: string, getAuthor: boolean): Promise<PodcastIndexEpisode | null> {
    console.log("getEpisodeByFeedGuidItemGuid", feedGuid, itemGuid);
    const episodeDataUrl = "https://api.podcastindex.org/api/1.0/episodes/byguid?guid=" + itemGuid + "&podcastguid=" + feedGuid;
    
    const response = await fetch(episodeDataUrl, this.getFetchOptions());
    const episodeResp = await response.json();
    // If episodeResp is a blank array, it means that the item was not found. Throw error
    if (Array.isArray(episodeResp) && episodeResp.length === 0) {
      throw new Error(`Episode not found for feedGuid ${feedGuid} and itemGuid ${itemGuid}`);
    }
    
    if(getAuthor) episodeResp.author = await this.getAuthorByFeedGuid(feedGuid);
    
    return episodeResp;
    
  }

  async getAuthorByFeedGuid(feedGuid: string): Promise<string> {
    console.log("getAuthorByFeedGuid", feedGuid);
    const feedDataUrl = "https://api.podcastindex.org/api/1.0/podcasts/byguid?guid=" + feedGuid;
    const response = await fetch(feedDataUrl, this.getFetchOptions());
    const feed = await response.json();
    return feed.feed.author;
  }

  async getEpisodesByFeedGuid(feedGuid: string): Promise<string> {
    console.log("getEpisodesByFeedGuid", feedGuid);
    const feedDataUrl = "https://api.podcastindex.org/api/1.0/episodes/bypodcastguid?guid=" + feedGuid;
    const response = await fetch(feedDataUrl, this.getFetchOptions());
    const feed = await response.json();
    return feed;
  }

  /**
   * Gets the fetch options for making a GET request to the Podcast Index API.
   *
   * @return {PciRequestInit} the options for the GET request
   */
  getFetchOptions(): PciRequestInit {
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    let data4Hash: any;
    if (process.env.PCI_KEY && process.env.PCI_SECRET) {
      data4Hash = process.env.PCI_KEY + process.env.PCI_SECRET + apiHeaderTime;
    } else {/*No API Keys Throw error*/ }

    const hash4Header = crypto.createHash('sha1').update(data4Hash).digest('hex');
    const options: PciRequestInit = {
      method: "get",
      headers: {
        "X-Auth-Date": apiHeaderTime.toString(),
        "X-Auth-Key": process.env.PCI_KEY || "default_value", //TODO: this isn't right
        "Authorization": hash4Header,
        "User-Agent": "v4vTaxonomy/0.0.1"
      },
    };
    return options;
  }
}

export interface PciRequestInit {
  method: string,
  headers: {
    "X-Auth-Date": string;
    "X-Auth-Key": string;
    "Authorization": string;
    "User-Agent": string;
  };
}

// define PodcastIndexEpisode interface
export interface PodcastIndexEpisode {
  author?: string;
  guid?: string;
  podcastGuid?: string;
  episode?: {
    feedImage?: string;
    image?: string;
    enclosureUrl?: string;
    feedTitle?: string;
    title?: string;
  };
}