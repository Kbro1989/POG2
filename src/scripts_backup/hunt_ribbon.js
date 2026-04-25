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
var HUDForensicsLimb_js_1 = require("../limbs/spatial/HUDForensicsLimb.js");
function huntRibbon() {
    return __awaiter(this, void 0, void 0, function () {
        var limb, probe, res, _i, _a, iface, labels, ribbonComponents, _b, ribbonComponents_1, comp;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    limb = new HUDForensicsLimb_js_1.HUDForensicsLimb();
                    probe = limb.healthCheck();
                    console.log("HUD Forensics Limb Health:", probe);
                    if (!probe.online)
                        return [2 /*return*/];
                    console.log("Hunting for 'Adventures' or 'Hero' in interfaces...");
                    return [4 /*yield*/, limb.searchInterfaces('Adventures', 50)];
                case 1:
                    res = _c.sent();
                    if (res.ok) {
                        for (_i = 0, _a = res.value; _i < _a.length; _i++) {
                            iface = _a[_i];
                            labels = iface.textLabels.join(" ").toLowerCase();
                            if (labels.includes("hero") && labels.includes("powers") && labels.includes("community")) {
                                console.log("\n>>> JACKPOT: Interface ID ".concat(iface.interfaceId, " contains the Ribbon! <<<"));
                                ribbonComponents = iface.components.filter(function (c) { return c.text || c.spriteId; });
                                for (_b = 0, ribbonComponents_1 = ribbonComponents; _b < ribbonComponents_1.length; _b++) {
                                    comp = ribbonComponents_1[_b];
                                    if (comp.text) {
                                        console.log("Comp: \tText: \"".concat(comp.text, "\", Sprite ID: ").concat(comp.spriteId));
                                    }
                                }
                            }
                            else if (labels.includes("adventures")) {
                                console.log("Partial match: Interface ID ".concat(iface.interfaceId));
                            }
                        }
                    }
                    else {
                        console.error("Search failed:", res.error);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
huntRibbon();
