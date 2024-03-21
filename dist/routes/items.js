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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const item_1 = require("../models/item");
const podcastindex_1 = __importDefault(require("../util/podcastindex/podcastindex"));
const body_parser_1 = __importDefault(require("body-parser"));
var jsonParser = body_parser_1.default.json();
var urlencodedParser = body_parser_1.default.urlencoded({ extended: false });
// getAll
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const items = await Item.find();
    res.status(400).json({ message: "Fetch All is not supported by this API" });
    // res.json(items);
}));
// get one item by id
router.get('/:id', getItem, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Finging item: " + req.params.id);
    try {
        res.send(res.item);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// get one item by feedGuid/itemGuid
router.get("/byguid/:feedGuid/:itemGuid", getItemByGuids, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield item_1.Item.findOne({ feedGuid: req.params.feedGuid, itemGuid: req.params.itemGuid });
    res.send(item);
}));
// get items by feedGuid
router.get("/byguid/:feedGuid", getItemsByFeedGuid, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield item_1.Item.find({ feedGuid: req.params.feedGuid });
    res.send(items);
}));
// get items by tags
router.get("/bytag/:tag", getItemByTags, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield item_1.Item.find({ tags: req.params.tag });
    res.send(items);
}));
// get all tags
router.get("/gettags/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("getting all unique tags in the database");
    const items = yield item_1.Item.find({ tags: { $ne: null } }).distinct('tags');
    res.send(items);
}));
// update
router.patch('/addtags/:feedGuid/:itemGuid', urlencodedParser, jsonParser, getItemByGuids, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let item = res.item;
    if (req.body.tags != null && item != null) {
        item[0].tags = sanitizeTags(req.body.tags);
        console.log("item " + JSON.stringify(item, null, 2));
    }
    try {
        if (item != null) {
            console.log(item);
            const updatedItem = yield item[0].save();
            res.json(updatedItem);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Add Tags by ID
router.patch('/addtags/:id', urlencodedParser, jsonParser, getItem, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // let item = await Item.findOne({ feedGuid: req.params.feedGuid, itemGuid: req.params.itemGuid });
    let item = res.item;
    if (req.body.tags != null && item != null) {
        item.tags = sanitizeTags(req.body.tags);
        // console.log("item " + JSON.stringify(item, null, 2));
    }
    try {
        if (item != null) {
            const updatedItem = yield item.save();
            res.json(updatedItem);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Add Tags to all songs in feed by feedGuid
// Add Tags to all songs in feed by feedGuid
router.patch('/addtagsbyfeedguid/:feedGuid', urlencodedParser, jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.tags != null) {
        try {
            const items = yield item_1.Item.updateMany({ feedGuid: req.params.feedGuid }, { $set: { tags: sanitizeTags(req.body.tags) } });
            res.json(items);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}));
// destroy
router.delete('/:id', getItem, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield res.item.deleteOne();
        res.json({ message: "Deleted the item from the database" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.delete('/byguid/:feedGuid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield item_1.Item.deleteMany({ feedGuid: req.params.feedGuid });
        res.json({ message: `Deleted ${items.deletedCount} items from the database` });
    }
    catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: error.message });
    }
}));
/************************************************************/
// Middleware
/************************************************************/
function getItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('getItem Middleware');
        let item;
        try {
            item = yield item_1.Item.findById(req.params.id);
            if (item == null) {
                // Item isn't in local db, get it from pci
                return res.status(404).json({ message: "Cannot find item in the database" });
            }
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
        res.item = item;
        next();
    });
}
function getItemByGuids(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // looks up items based on feedGuid and itemGuid
        var _a, _b, _c, _d, _e, _f;
        let feedGuid = req.params.feedGuid;
        let itemGuid = req.params.itemGuid;
        let tagItem = new item_1.Item;
        try {
            let item = yield item_1.Item.find({ feedGuid: feedGuid, itemGuid: itemGuid }).exec();
            // console.log("Item \n" + JSON.stringify(item, null, 2));
            if (item.length == 0) {
                // Item isn't in the database get it from PCI
                const pci = new podcastindex_1.default;
                tagItem.artistName = yield pci.getAuthorByFeedGuid(feedGuid);
                const pciItem = yield pci.getEpisodeByFeedGuidItemGuid(feedGuid, itemGuid, true);
                // console.log("RESPONSE FROM PCI: \n"+JSON.stringify(pciItem, null, 4));
                tagItem.artistName = pciItem === null || pciItem === void 0 ? void 0 : pciItem.author;
                tagItem.feedGuid = feedGuid;
                tagItem.itemGuid = itemGuid;
                if (((_a = tagItem.imageURL) === null || _a === void 0 ? void 0 : _a.length) === 0 || tagItem.imageURL == null || tagItem.imageURL == '') {
                    tagItem.imageURL = (_b = pciItem === null || pciItem === void 0 ? void 0 : pciItem.episode) === null || _b === void 0 ? void 0 : _b.feedImage;
                }
                else {
                    tagItem.imageURL = (_c = pciItem === null || pciItem === void 0 ? void 0 : pciItem.episode) === null || _c === void 0 ? void 0 : _c.image;
                }
                tagItem.mp3URL = (_d = pciItem === null || pciItem === void 0 ? void 0 : pciItem.episode) === null || _d === void 0 ? void 0 : _d.enclosureUrl;
                tagItem.albumName = (_e = pciItem === null || pciItem === void 0 ? void 0 : pciItem.episode) === null || _e === void 0 ? void 0 : _e.feedTitle;
                tagItem.title = (_f = pciItem === null || pciItem === void 0 ? void 0 : pciItem.episode) === null || _f === void 0 ? void 0 : _f.title;
                tagItem = yield tagItem.save();
                res.item = tagItem;
            }
            else
                (res.item = item);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
        next();
    });
}
function getItemsByFeedGuid(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: Implement
        // looks up items based on feedGuid
        let feedGuid = req.params.feedGuid;
        console.log("Lookup by feedGuid" + feedGuid);
        let items;
        const pci = new podcastindex_1.default;
        const author = yield pci.getAuthorByFeedGuid(feedGuid);
        let pciFeed = {};
        try {
            pciFeed = yield pci.getEpisodesByFeedGuid(feedGuid);
            if (pciFeed.feed != null) {
                return res.status(404).json({ message: pciFeed.description });
            }
            // console.log("RESPONSE FROM PCI: \n"+JSON.stringify(pciFeed, null, 4));
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
        for (let i = 0; i < pciFeed.items.length; i++) {
            let pciItem = pciFeed.items[i];
            // console.log("Item \n" + JSON.stringify(pciItem, null, 2));
            let item = new item_1.Item;
            try {
                // check if item is in db
                let item = yield item_1.Item.findOne({ feedGuid: feedGuid, itemGuid: pciItem.guid }).exec();
                // TODO: deduplicate code
                if (item != null) {
                    // Item is in the db update it
                    item.synced = new Date(Date.now());
                    if (pciItem.image == null || pciItem.image.legth == 0 || pciItem.image == '') {
                        item.imageURL = pciItem.feedImage;
                    }
                    else {
                        item.imageURL = pciItem.image;
                    }
                    item.mp3URL = pciItem.enclosureUrl;
                    item.artistName = author;
                    item.albumName = pciItem.feedTitle;
                    item.title = pciItem.title;
                    item = yield item.save();
                }
                else {
                    //Item is not in db create it
                    item = new item_1.Item();
                    item.feedGuid = feedGuid;
                    item.itemGuid = pciItem.guid;
                    item.synced = new Date(Date.now());
                    if (pciItem.image == null || pciItem.image.legth == 0 || pciItem.image == '') {
                        item.imageURL = pciItem.feedImage;
                    }
                    else {
                        item.imageURL = pciItem.image;
                    }
                    item.mp3URL = pciItem.enclosureUrl;
                    item.artistName = author;
                    item.albumName = pciItem.feedTitle;
                    item.title = pciItem.title;
                    item = yield item.save();
                }
            }
            catch (error) {
                console.log("Error: " + error.message);
            }
        }
        res.items = items;
        next();
    });
}
function getItemByTags(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('getItemByTags Middleware', req.params);
        // looks up items based on tags
        let item;
        try {
            item = yield item_1.Item.find({ tags: req.params.tag }).exec();
            if (item == null) {
                // Item isn't in locapodcastItemToLocalIteml db, get it from pci
                return res.status(404).json({ message: "Cannot find item in the database" });
            }
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
        res.item = item;
        next();
    });
}
function sanitizeTags(tags) {
    let sanitized = [];
    for (let i = 0; i < tags.length; i++) {
        sanitized[i] = tags[i].toLowerCase();
    }
    return sanitized;
}
exports.default = router;
