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
exports.Indexes = void 0;
const generateTypos_1 = require("../shared/generateTypos");
class Indexes {
    constructor(firestoreInstance, config, props) {
        this.firestoreInstance = firestoreInstance;
        this.config = config;
        this.props = props;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const typos = (0, generateTypos_1.generateTypos)(this.props.inputField, this.props.wordMaxLength);
            return yield this.saveWithLimitedKeywords(this.props.returnedFields, Array.from(typos));
        });
    }
    saveWithLimitedKeywords(returnedFields, keywords) {
        return __awaiter(this, void 0, void 0, function* () {
            const bulk = this.firestoreInstance.bulkWriter();
            yield this.cleanOldIndexes(returnedFields, bulk);
            const chunkSize = 800;
            const keywordChunks = [];
            for (let i = 0; i < keywords.length; i += chunkSize) {
                keywordChunks.push(keywords.slice(i, i + chunkSize));
            }
            for (let j = 0; j < keywordChunks.length; j++) {
                bulk.create(this.firestoreInstance.collection(this.config.collection).doc(), Object.assign({ search_keywords: keywordChunks[j] }, returnedFields));
                if (j % 500 === 0) {
                    yield bulk.flush();
                }
            }
            yield bulk.close();
            return;
        });
    }
    cleanOldIndexes(returnedFields, bulk) {
        return __awaiter(this, void 0, void 0, function* () {
            const { indexedDocumentPath } = returnedFields;
            const query = yield this.firestoreInstance
                .collection(this.config.collection)
                .where("indexedDocumentPath", "==", indexedDocumentPath)
                .get();
            if (query.empty)
                return;
            for (let j = 0; j < query.docs.length; j++) {
                bulk.delete(query.docs[j].ref);
                if (j % 500 === 0)
                    yield bulk.flush();
            }
            yield bulk.flush();
            return;
        });
    }
}
exports.Indexes = Indexes;
//# sourceMappingURL=Indexes.js.map