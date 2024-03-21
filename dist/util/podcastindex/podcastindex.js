"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file is a class that interface with the podcastindex api
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
const crypto_1 = __importDefault(require("crypto"));
// getEpisodeByFeedGuidItemGuid('1001e490-9b28-59f1-b120-5aa0866862d7', '30cd825f-66be-41f7-93cd-f84084c7bf48');
class PodcastIndex {
    /**
     * Get an episode by its feed guid and item guid.
     *
     * @param feedGuid The guid of the feed that the episode belongs to
     * @param itemGuid The guid of the item that represents the episode
     * @returns The episode data from the Podcast Index API, or null if not found
     * @throws {Error} If the episode cannot be found
     */
    getEpisodeByFeedGuidItemGuid(feedGuid, itemGuid, getAuthor) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getEpisodeByFeedGuidItemGuid", feedGuid, itemGuid);
            const episodeDataUrl = "https://api.podcastindex.org/api/1.0/episodes/byguid?guid=" + itemGuid + "&podcastguid=" + feedGuid;
            const response = yield fetch(episodeDataUrl, this.getFetchOptions());
            const episodeResp = yield response.json();
            // If episodeResp is a blank array, it means that the item was not found. Throw error
            if (Array.isArray(episodeResp) && episodeResp.length === 0) {
                throw new Error(`Episode not found for feedGuid ${feedGuid} and itemGuid ${itemGuid}`);
            }
            if (getAuthor)
                episodeResp.author = yield this.getAuthorByFeedGuid(feedGuid);
            return episodeResp;
        });
    }
    getAuthorByFeedGuid(feedGuid) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getAuthorByFeedGuid", feedGuid);
            const feedDataUrl = "https://api.podcastindex.org/api/1.0/podcasts/byguid?guid=" + feedGuid;
            const response = yield fetch(feedDataUrl, this.getFetchOptions());
            const feed = yield response.json();
            return feed.feed.author;
        });
    }
    getEpisodesByFeedGuid(feedGuid) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getEpisodesByFeedGuid", feedGuid);
            const feedDataUrl = "https://api.podcastindex.org/api/1.0/episodes/bypodcastguid?guid=" + feedGuid;
            const response = yield fetch(feedDataUrl, this.getFetchOptions());
            const feed = yield response.json();
            return feed;
        });
    }
    /**
     * Gets the fetch options for making a GET request to the Podcast Index API.
     *
     * @return {PciRequestInit} the options for the GET request
     */
    getFetchOptions() {
        const apiHeaderTime = Math.floor(Date.now() / 1000);
        let data4Hash;
        if (process.env.PCI_KEY && process.env.PCI_SECRET) {
            data4Hash = process.env.PCI_KEY + process.env.PCI_SECRET + apiHeaderTime;
        }
        else { /*No API Keys Throw error*/ }
        const hash4Header = crypto_1.default.createHash('sha1').update(data4Hash).digest('hex');
        const options = {
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
exports.default = PodcastIndex;
