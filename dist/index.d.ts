export type FirestoreSearchEngineIndexesProps = {
    inputField: string;
    returnedFields: {
        indexedDocumentPath: string;
    } & Record<string, any>;
    wordMaxLength?: number;
};
export type FirestoreSearchEngineSearchProps = {
    fieldValue: string;
};
export type FirestoreSearchEngineConfig = {
    collection: string;
};
export { FirestoreSearchEngine } from "./FirestoreSearchEngine";
