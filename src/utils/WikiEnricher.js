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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WikiEnricher = void 0;
var logger_js_1 = require("./logger.js");
var logger = (0, logger_js_1.createLogger)('WikiEnricher');
/**
 * WikiEnricher â€” Contextualizes professional assets via RuneScape Wiki.
 */
var WikiEnricher = /** @class */ (function () {
    function WikiEnricher() {
    }
    /**
     * Enrich a model's semantic context by searching the wiki.
     */
    WikiEnricher.enrich = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var searchParams, searchResponse, searchData, searchResult, pageTitle, contentParams, contentResponse, contentData, pages, pageId, extract, url, role, intent, race, lowerExtract, err_1;
            var _a, _b;
            var _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!name || name === 'unknown') {
                            return [2 /*return*/, {
                                    ok: true,
                                    value: {
                                        name: 'Unknown Asset',
                                        role: 'Background Prop',
                                        intent: 'Generic environment filler',
                                        url: 'https://runescape.wiki'
                                    }
                                }];
                        }
                        logger.info({ name: name }, 'Fetching wiki context');
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 7, , 8]);
                        searchParams = new URLSearchParams({
                            action: 'query',
                            format: 'json',
                            list: 'search',
                            srsearch: name,
                            srlimit: '1',
                            origin: '*'
                        });
                        return [4 /*yield*/, fetch("".concat(this.API_URL, "?").concat(searchParams.toString()))];
                    case 2:
                        searchResponse = _g.sent();
                        return [4 /*yield*/, searchResponse.json()];
                    case 3:
                        searchData = _g.sent();
                        searchResult = (_d = (_c = searchData.query) === null || _c === void 0 ? void 0 : _c.search) === null || _d === void 0 ? void 0 : _d[0];
                        if (!searchResult) {
                            return [2 /*return*/, {
                                    ok: true,
                                    value: {
                                        name: name,
                                        role: 'Uncategorized',
                                        intent: 'Production asset without wiki mapping',
                                        url: 'https://runescape.wiki'
                                    }
                                }];
                        }
                        pageTitle = searchResult.title;
                        contentParams = new URLSearchParams({
                            action: 'query',
                            format: 'json',
                            prop: 'extracts',
                            exintro: '1',
                            explaintext: '1',
                            titles: pageTitle,
                            origin: '*'
                        });
                        return [4 /*yield*/, fetch("".concat(this.API_URL, "?").concat(contentParams.toString()))];
                    case 4:
                        contentResponse = _g.sent();
                        return [4 /*yield*/, contentResponse.json()];
                    case 5:
                        contentData = _g.sent();
                        pages = ((_e = contentData.query) === null || _e === void 0 ? void 0 : _e.pages) || {};
                        pageId = Object.keys(pages)[0];
                        extract = ((_f = pages[pageId]) === null || _f === void 0 ? void 0 : _f.extract) || '';
                        url = "https://runescape.wiki/w/".concat(encodeURIComponent(pageTitle));
                        role = 'Environmental Object';
                        intent = extract.substring(0, 500);
                        race = void 0;
                        lowerExtract = extract.toLowerCase();
                        if (lowerExtract.includes('npc') || lowerExtract.includes('character') || lowerExtract.includes('boss')) {
                            role = 'Interactive NPC';
                        }
                        else if (lowerExtract.includes('item') || lowerExtract.includes('equipment')) {
                            role = 'ITEM';
                        }
                        // Race detection
                        if (lowerExtract.includes('human'))
                            race = 'Human';
                        else if (lowerExtract.includes('dragon'))
                            race = 'Dragon';
                        else if (lowerExtract.includes('demon'))
                            race = 'Demon';
                        else if (lowerExtract.includes('beast'))
                            race = 'Beast';
                        _a = {
                            ok: true
                        };
                        _b = {
                            name: pageTitle,
                            role: role,
                            race: race,
                            intent: intent,
                            url: url
                        };
                        return [4 /*yield*/, this.fetchInfoboxData(pageTitle)];
                    case 6: return [2 /*return*/, (_a.value = (_b.variables = _g.sent(),
                            _b),
                            _a)];
                    case 7:
                        err_1 = _g.sent();
                        logger.error({ err: err_1, name: name }, 'Wiki enrichment failed');
                        return [2 /*return*/, { ok: false, error: err_1 }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Specialized enrichment for NPCs.
     */
    WikiEnricher.enrichNpc = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.enrich(name)];
            });
        });
    };
    /**
     * Specialized enrichment for Items.
     */
    WikiEnricher.enrichItem = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.enrich(name)];
            });
        });
    };
    /**
     * fetchInfoboxData(title) - Extracts variables from the MediaWiki Infobox.
     */
    WikiEnricher.fetchInfoboxData = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, data, wikitext, variables, matches, _i, matches_1, match, e_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        params = new URLSearchParams({
                            action: 'parse',
                            format: 'json',
                            page: title,
                            prop: 'wikitext',
                            origin: '*'
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.API_URL, "?").concat(params.toString()))];
                    case 2:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _c.sent();
                        wikitext = ((_b = (_a = data.parse) === null || _a === void 0 ? void 0 : _a.wikitext) === null || _b === void 0 ? void 0 : _b['*']) || '';
                        variables = {};
                        matches = wikitext.matchAll(/\|\s*([\w\d]+)\s*=\s*([^|\n}]+)/g);
                        for (_i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
                            match = matches_1[_i];
                            variables[match[1].trim()] = match[2].trim();
                        }
                        return [2 /*return*/, variables];
                    case 4:
                        e_1 = _c.sent();
                        logger.error({ title: title, error: e_1.message }, 'Infobox parsing failed.');
                        return [2 /*return*/, {}];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * fetchPageLinks(title) - Extracts all internal wiki links from a page.
     * Useful for finding associated NPCs/Items/Objects for a minigame.
     */
    WikiEnricher.fetchPageLinks = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, data, pages, pageId, links, e_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        params = new URLSearchParams({
                            action: 'query',
                            format: 'json',
                            titles: title,
                            prop: 'links',
                            pllimit: 'max',
                            origin: '*'
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.API_URL, "?").concat(params.toString()))];
                    case 2:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _c.sent();
                        pages = ((_a = data.query) === null || _a === void 0 ? void 0 : _a.pages) || {};
                        pageId = Object.keys(pages)[0];
                        links = ((_b = pages[pageId]) === null || _b === void 0 ? void 0 : _b.links) || [];
                        return [2 /*return*/, links.map(function (l) { return l.title; })];
                    case 4:
                        e_2 = _c.sent();
                        logger.error({ title: title, error: e_2.message }, 'Link extraction failed.');
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    WikiEnricher.API_URL = 'https://runescape.wiki/api.php';
    return WikiEnricher;
}());
exports.WikiEnricher = WikiEnricher;
