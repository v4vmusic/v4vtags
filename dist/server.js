"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const items_js_1 = __importDefault(require("./routes/items.js"));
const tags_js_1 = __importDefault(require("./routes/tags.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const host = process.env.HOST;
const port = process.env.PORT;
const databaseURL = (_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : '';
mongoose_1.default.connect(databaseURL, {});
const db = mongoose_1.default.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));
app.use('/items', items_js_1.default);
app.use('/tags', tags_js_1.default);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
