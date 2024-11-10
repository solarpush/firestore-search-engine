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
});

//you can provide other searchEngine for each collection you want indexing with another collectionValue
```

After that, call a searchEngine.indexes for index your document when you create it:

```javascript
const updateName = "YourFieldValue";
const documentId = "YourDocumentId";
const myDocumentRef = firestore()
  .collection("YourCollectionName")
  .doc(documentId);
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
searchEngine.expressWrapper(app); //add optional second parmateters to change the default path "/search" to your custom path
//url :`yourBaseUrl/search/${inputValue}`
//method :GET
```

### onRequest wrapper

```javascript
import { FirestoreSearchEngine } from "firestore-search-engine";

export const searchUserName = onRequest(
  { region: "europe-west3" },
  searchEngineUserName.onRequestWrapper()
);
//url :`yourBaseUrl/functionName/search?searchValue=${inputValue}`
//method :GET
```

## Why Firestore Search Engine?

Firestore is a powerful, serverless solution provided by Google Cloud Platform for your data storage needs. Yet it does not come with a full-text search feature. Firestore Search Engine package gives you the ability to provide your application with a powerful search feature without significant coding effort. With its easy configuration and extensive documentation, the Firestore Search Engine package is a great choice for empowering your Firestore-based applications with full-text search capabilities.

Please read our documentation carefully to understand how to best utilise Firestore Search Engine in your project and feel free to raise any issues or feature requests.
