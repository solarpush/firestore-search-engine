# Firestore Search Engine

This is a powerful and flexible search engine server for Firestore. This package allows developers to quickly and efficiently add search capability to their Firestore-based applications.

It's Node.js package, so you can use it in your Cloud Functions or any other Node.js environment. It's also compatible with TypeScript.

**This package is not intended for front-end usage!**

Firestore Search Engine Package
This is a powerful and flexible search engine server for Firestore. This package allows developers to quickly and efficiently add search capability to their Firestore-based applications.

## Key Features

- Out-of-the-box Firestore configuration support
- Full-text searching of Firestore documents
- Search by any keypath in the document
- Support only string search
- Full wrapped for express/onCall/onRequest functions
- Built-in Firestore Triggers onCreate/onUpdate/onDelete for automated features

When you know how it work you take only 5 minutes for implement new indexed field for a document and build endpoint for search it

for the moment **express is recommended** for build only on search functions and provide all your routes behind
but onCall and onRequest impl worked too

## Installation

```bash
npm install firestore-search-engine
```

## Usage

Start by importing all the required modules from the package:

```javascript
//esModuleSyntax
import { FirestoreSearchEngine } from "firestore-search-engine";

//commonJsSyntax
const { FirestoreSearchEngine } = require("firestore-search-engine");
```

Then, create an instance of the FirestoreSearchEngine:

```javascript
//init the search engine and provide the engine to your app
//outside of onRequest or onCall  or middleWare function
export const searchEngineUserName = new FirestoreSearchEngine(firestore(), {
  collection: "YourCollectionName", //not change collection after indexing or re-indexe all
  // or sub collection is "YourCollectionName/YourDocumentName/YourSubCollectionName"
});

//you can provide other searchEngine for each collection you want indexing with another collectionValue
```

### Manual indexing

Call a searchEngine.indexes for index your document at the same time of you create it:

```javascript
const updateName = "YourFieldValue";
const documentId = "YourDocumentId";
const myDocumentRef = firestore()
  .collection("YourCollectionName")
  .doc(documentId); // or sub collection
//first save you doc
await myDocumentRef.set(
  { name: updateName, docId: documentId },
  { merge: true }
);
//at same time re-index your document from the search fiels you want search in the inputField
await searchEngineUserName.indexes({
  inputField: updateName,
  returnedFields: {
    indexedDocumentPath: myDocumentRef.path, //required field for index only 1 time each document
    name: updateName, //optional fields you can add the key who you need to be returned in the search result
    docId: documentId, //optional fields you can add the key who you need to be returned in the search result
  },
  //you can Promise.all([myDocumentRef.set(
  //   { name: updateName, docId: documentId },
  //   { merge: true }
  // ), searchEngineUserName.indexes({
  // inputField: updateName,
  // returnedFields: {
  //   indexedDocumentPath: myDocumentRef.path,
  //   name: updateName,
  //   docId: documentId,
  // }])
});
```

Finally, execute the search operation:

```javascript
const results = await searchEngineUserName.search({
  fieldValue: inputField,
}); //That will return all document information who are saved in dexed values
```

The results object will hold the documents that matched your search term.

## Example

Below is a complete usage example of the Firestore Search Engine Package:

### express wrapper

```javascript
// index.ts
import { FirestoreSearchEngine } from "firestore-search-engine";
const app = express();
searchEngineUserName.expressWrapper(app); //add optional second parmateters to change the default path "/search" to your custom path
//url :`yourBaseUrl/search/${inputValue}`
//method :GET
```

### onRequest wrapper

```javascript
import { FirestoreSearchEngine } from "firestore-search-engine";

export const searchUserName = onRequest(
  { region: "europe-west3" },
  searchEngineUserName.onRequestWrapped()
);
//url :`yourBaseUrl/functionName/search?searchValue=${inputValue}`
//method :GET
```

### onCall wrapped

```javascript
import { FirestoreSearchEngine } from "firestore-search-engine";

const authCallback = (auth: CallableRequest["auth"]) => {
  if (auth && auth.uid) return true;
  return false;
};
export const onCallSearchWrapped = onCall(
  { region: "europe-west3" },
  searchEngineUserName.onCallWrapped(authCallback)
);
//in Front-end callableFunction call with :
//
httpsCallable(searchUserName)({ searchValue: inputValue });
//method: Managed from front package
```

### Automatic Indexing from Firestore Triggers

The package provide 3 functions to index your document automatically when you create / update / delete it, you can use it like this

#### onWrite wrapper

```javascript
export const firestoreWriter = searchEngineUserName.onDocumentWriteWrapper(
  onDocumentCreated, // onDocumentCreated method
  { indexedKey: "test", returnedKey: ["other", "setAt"] }, // the key you want to index and return in the search result
  "test/{testId}", //documentPath or subCollectionDocumentPath  && 5 recursive level only
  { wordMaxLength: 25 }, //optional config object set undefined, to default accept wordMinLength: 3, wordMaxLength: 50 for indexing control and reduce indexing size
  { region: "europe-west3" } //EventHandlerOptions optional
);
```

#### onUpdate wrapper

```javascript
export const firestoreUpdated = searchEngineUserName.onDocumentUpdateWrapper(
  onDocumentUpdated, // onDocumentUpdated method
  { indexedKey: "test", returnedKey: ["other", "setAt"] }, // the key you want to index and return in the search result
  "test/{testId}", //documentPath or subCollectionDocumentPath  && 5 recursive level only
  { wordMinLength: 3 }, //optional config object set {} to default accept wordMinLength: 3, wordMaxLength: 50 for indexing control
  { region: "europe-west3" } //EventHandlerOptions optional
);
```

#### onDelete wraper

```javascript
export const firestoreDeleted = searchEngineUserName.onDocumentDeletedWrapper(
  onDocumentDeleted, // onDocumentDeleted method
  "test/{testId}", //documentPath or subCollectionDocumentPath  && 5 recursive level only
  { region: "europe-west3" } //EventHandlerOptions optional
);
```

## Why Firestore Search Engine ?

Firestore is a powerful, serverless solution provided by Google Cloud Platform for your data storage needs. Yet it does not come with a full-text search feature. Firestore Search Engine package gives you the ability to provide your application with a powerful search feature without significant coding effort. With its easy configuration and extensive documentation, the Firestore Search Engine package is a great choice for empowering your Firestore-based applications with full-text search capabilities.

Please read our documentation carefully to understand how to best utilise Firestore Search Engine in your project and feel free to raise any issues or feature requests.
