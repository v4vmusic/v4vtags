// This file is a class that interface with the podcastindex api
import dotenv from "dotenv"
dotenv.config({ path: '../.env' });
import crypto from 'crypto';



// getEpisodeByFeedGuidItemGuid('1001e490-9b28-59f1-b120-5aa0866862d7', '30cd825f-66be-41f7-93cd-f84084c7bf48');

export default class PodcastIndex {

  async getEpisodeByFeedGuidItemGuid(feedGuid, itemGuid) {
    console.log("getEpisodeByFeedGuidItemGuid", feedGuid, itemGuid);
    const episodeDataUrl = "https://api.podcastindex.org/api/1.0/episodes/byguid?guid=" + itemGuid + "&podcastguid=" + feedGuid;
    const response = await fetch(episodeDataUrl, this.getFetchOptions());
    const episode = await response.json();
    // If episode is a blank array, it means that the item was not found. Throw error

    return episode;
  }


  /**
   * Gets the fetch options for making a GET request to the API.
   *
   * @return {Object} the options for the GET request
   */
  getFetchOptions() {
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const data4Hash = process.env.PCI_KEY + process.env.PCI_SECRET + apiHeaderTime;
    const hash4Header = crypto.createHash('sha1').update(data4Hash).digest('hex');
    const options = {
      method: "get",
      headers: {
        "X-Auth-Date": "" + apiHeaderTime,
        "X-Auth-Key": process.env.PCI_KEY,
        "Authorization": hash4Header,
        "User-Agent": "v4vTaxonomy/0.0.1"
      },
    };
    return options;
  }
}