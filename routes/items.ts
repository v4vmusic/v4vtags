import express, { Router, Request, Response } from "express";
const router: Router = express.Router();
import { Item } from "../models/item";
import PodcastIndex from "../util/podcastindex/podcastindex";
import bodyParser from "body-parser";


var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// getAll
router.get("/", async (req, res) => {
    // const items = await Item.find();
    res.status(400).json({ message: "Fetch All is not supported by this API" });
    // res.json(items);
});



// get one item by id
router.get('/:id', getItem, async (req, res: any) => {
    console.log("Finging item: " + req.params.id);
    try {
        res.send(res.item);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// get one item by feedGuid/itemGuid
router.get("/byguid/:feedGuid/:itemGuid", getItemByGuids, async (req, res) => {
    const item = await Item.findOne({ feedGuid: req.params.feedGuid, itemGuid: req.params.itemGuid });
    res.send(item);
});

// get items by feedGuid
router.get("/byguid/:feedGuid", getItemsByFeedGuid, async (req, res) => {
    const items = await Item.find({ feedGuid: req.params.feedGuid });
    res.send(items);
});

// get items by tags
router.get("/bytag/:tag", getItemByTags, async (req, res) => {
    const items = await Item.find({ tags: req.params.tag });
    res.send(items);
});

// get all tags
router.get("/gettags/", async (req, res) => {
    console.log("getting all unique tags in the database");
    
    const items = await Item.find({ tags: { $ne: null } }).distinct('tags');
    res.send(items);
});

// update
router.patch('/addtags/:feedGuid/:itemGuid', urlencodedParser, jsonParser, getItemByGuids, async (req: any, res: any) => {
    let item: Item[] = res.item;
    if (req.body.tags != null && item != null) {
        item[0].tags = sanitizeTags(req.body.tags);
        console.log("item " + JSON.stringify(item, null, 2));
    }

    try {
        if (item != null) {
            console.log(item);
            
            const updatedItem = await item[0].save();
            res.json(updatedItem);
        }

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Add Tags by ID
router.patch('/addtags/:id', urlencodedParser, jsonParser, getItem, async (req: any, res: any) => {
    // let item = await Item.findOne({ feedGuid: req.params.feedGuid, itemGuid: req.params.itemGuid });
    let item = res.item;
    if (req.body.tags != null && item != null) {
        item.tags = sanitizeTags(req.body.tags);
        // console.log("item " + JSON.stringify(item, null, 2));
    }

    try {
        if (item != null) {
            const updatedItem = await item.save();
            res.json(updatedItem);
        }

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Add Tags to all songs in feed by feedGuid

// Add Tags to all songs in feed by feedGuid
router.patch('/addtagsbyfeedguid/:feedGuid', urlencodedParser, jsonParser, async (req: any, res: any) => {
    if (req.body.tags != null) {
        try {
            const items = await Item.updateMany({ feedGuid: req.params.feedGuid }, { $set: { tags: sanitizeTags(req.body.tags) } });
            res.json(items);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
});

// destroy

router.delete('/:id', getItem, async (req, res: any) => {
    try {
        await res.item.deleteOne();
        res.json({ message: "Deleted the item from the database" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/byguid/:feedGuid', async (req: any, res: any) => {
    try {        // sanitize user input
        const items = await Item.deleteMany({ feedGuid: req.params.feedGuid });
        res.json({ message: `Deleted ${items.deletedCount} items from the database` });
    } catch (error: any) {
        console.log("Error: " + error);
        res.status(500).json({ message: error.message });
    }
});


/************************************************************/
// Middleware
/************************************************************/
async function getItem(req: Request, res: any, next: Function) {
    // console.log('getItem Middleware');
    let item: Item | null;
    try {
        item = await Item.findById(req.params.id);
        if (item == null) {
            // Item isn't in local db, get it from pci
            return res.status(404).json({ message: "Cannot find item in the database" });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
    res.item = item;
    next();
}

async function getItemByGuids(req: Request, res: any, next: Function) {
    // looks up items based on feedGuid and itemGuid

    let feedGuid = req.params.feedGuid;
    let itemGuid = req.params.itemGuid;

    let tagItem: Item = new Item;
    try {
        let item = await Item.find({ feedGuid: feedGuid, itemGuid: itemGuid }).exec();
        // console.log("Item \n" + JSON.stringify(item, null, 2));
        if (item.length == 0) {
            // Item isn't in the database get it from PCI
            const pci = new PodcastIndex;
            tagItem.artistName = await pci.getAuthorByFeedGuid(feedGuid);
            const pciItem = await pci.getEpisodeByFeedGuidItemGuid(feedGuid, itemGuid, true);
            // console.log("RESPONSE FROM PCI: \n"+JSON.stringify(pciItem, null, 4));
            tagItem.artistName = pciItem?.author;
            tagItem.feedGuid = feedGuid;
            tagItem.itemGuid = itemGuid;
            if (tagItem.imageURL?.length === 0 || tagItem.imageURL == null || tagItem.imageURL == '') {
                tagItem.imageURL = pciItem?.episode?.feedImage;
            } else {
                tagItem.imageURL = pciItem?.episode?.image;
            }
            tagItem.mp3URL = pciItem?.episode?.enclosureUrl;
            tagItem.albumName = pciItem?.episode?.feedTitle;
            tagItem.title = pciItem?.episode?.title;

            tagItem = await tagItem.save();
            res.item = tagItem;
        } else (
            res.item = item
        )
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
    next();
}

async function getItemsByFeedGuid(req: Request, res: any, next: Function) {
    // TODO: Implement
    // looks up items based on feedGuid
    let feedGuid = req.params.feedGuid;
    console.log("Lookup by feedGuid" + feedGuid);
    let items;
    const pci = new PodcastIndex;
    const author = await pci.getAuthorByFeedGuid(feedGuid);
    let pciFeed: any = {};
    try {
        pciFeed = await pci.getEpisodesByFeedGuid(feedGuid);
        if (pciFeed.feed != null) {
            return res.status(404).json({ message: pciFeed.description });
        }
        // console.log("RESPONSE FROM PCI: \n"+JSON.stringify(pciFeed, null, 4));
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }

    for (let i = 0; i < pciFeed.items.length; i++) {
        let pciItem = pciFeed.items[i];
        // console.log("Item \n" + JSON.stringify(pciItem, null, 2));

        let item: Item = new Item
        try {
            // check if item is in db
            let item = await Item.findOne({ feedGuid: feedGuid, itemGuid: pciItem.guid }).exec();

            // TODO: deduplicate code
            if (item != null) {
                // Item is in the db update it
                item.synced = new Date(Date.now());
                if (pciItem.image == null || pciItem.image.legth == 0 || pciItem.image == '') {
                    item.imageURL = pciItem.feedImage;
                } else {
                    item.imageURL = pciItem.image;
                }
                item.mp3URL = pciItem.enclosureUrl;
                item.artistName = author;
                item.albumName = pciItem.feedTitle;
                item.title = pciItem.title;
                item = await item.save();
            } else {
                //Item is not in db create it
                item = new Item();
                item.feedGuid = feedGuid;
                item.itemGuid = pciItem.guid;
                item.synced = new Date(Date.now());

                if (pciItem.image == null || pciItem.image.legth == 0 || pciItem.image == '') {
                    item.imageURL = pciItem.feedImage;
                } else {
                    item.imageURL = pciItem.image;
                }

                item.mp3URL = pciItem.enclosureUrl;
                item.artistName = author;
                item.albumName = pciItem.feedTitle;
                item.title = pciItem.title;
                item = await item.save();
            }
        } catch (error: any) {
            console.log("Error: " + error.message);
        }
    }
    res.items = items;
    next();
}



async function getItemByTags(req: Request, res: any, next: Function) {
    console.log('getItemByTags Middleware', req.params);
    // looks up items based on tags
    let item;
    try {
        item = await Item.find({tags: req.params.tag}).exec();
        if (item == null) {
            // Item isn't in locapodcastItemToLocalIteml db, get it from pci
            return res.status(404).json({ message: "Cannot find item in the database" });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
    res.item = item;
    next();
}



function sanitizeTags(tags: string[]) {
    //TODO: better sanitization, johnny drop table
    let sanitized = [];
    for (let i = 0; i < tags.length; i++) {
        sanitized[i] = tags[i].toLowerCase();
    }
    return sanitized;
}


export default router;