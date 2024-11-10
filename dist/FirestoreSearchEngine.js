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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreSearchEngine = void 0;
const Indexes_1 = require("./indexes/Indexes");
const Search_1 = require("./search/Search");
class FirestoreSearchEngine {
    constructor(firestoreInstance, config) {
        this.firestoreInstance = firestoreInstance;
        this.config = config;
        //Configure Firestore for never throw if undefined value
        this.firestoreInstance.settings({ ignoreUndefinedProperties: true });
    }
    search(props) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof props.fieldValue !== "string" || props.fieldValue.length === 0) {
                throw new Error("fieldValue is required and must be a non-empty string.");
            }
            return yield new Search_1.Search(this.firestoreInstance, this.config, props).execute();
        });
    }
    indexes(props) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof props.inputField !== "string" || props.inputField.length === 0) {
                throw new Error("fieldValue is required and must be a non-empty string.");
            }
            return yield new Indexes_1.Indexes(this.firestoreInstance, this.config, props).execute();
        });
    }
}
exports.FirestoreSearchEngine = FirestoreSearchEngine;
//# sourceMappingURL=FirestoreSearchEngine.js.map