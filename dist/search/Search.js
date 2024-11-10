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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = void 0;
const generateCharArray_1 = require("../shared/generateCharArray");
const levenshteinDistance_1 = require("../shared/levenshteinDistance");
class Search {
    constructor(firestoreInstance, config, props) {
        this.firestoreInstance = firestoreInstance;
        this.config = config;
        this.props = props;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.search(this.props.fieldValue);
        });
    }
    search(fieldValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchKeywords = (0, generateCharArray_1.generateCharArray)(fieldValue);
            const querySnapshot = yield this.firestoreInstance
                .collection(this.config.collection)
                .where("search_keywords", "array-contains-any", [...searchKeywords])
                .get();
            if (querySnapshot.empty) {
                return [];
            }
            const uniqueDocs = new Set();
            const results = [];
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                const { search_keywords } = data, rest = __rest(data, ["search_keywords"]);
                const uniqueId = data.indexedDocumentPath;
                const isCloseEnough = search_keywords.some((keyword) => fieldValue
                    .split(" ")
                    .some((word) => (0, levenshteinDistance_1.levenshteinDistance)(word, keyword) <= 2));
                if (isCloseEnough && !uniqueDocs.has(uniqueId)) {
                    uniqueDocs.add(uniqueId);
                    results.push(rest);
                }
            }
            return results;
        });
    }
}
exports.Search = Search;
//# sourceMappingURL=Search.js.map