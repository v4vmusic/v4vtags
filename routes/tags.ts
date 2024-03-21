import express, { Router, Request, Response } from "express";
const router: Router = express.Router();
import { Item } from "../models/item";


// get all tags
router.get("/", async (req, res) => {
    console.log("getting all unique tags in the database");
    
    const tags = await Item.find({ tags: { $ne: null } }).distinct('tags');
    res.send(tags);
});



export default router;