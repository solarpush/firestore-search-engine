# Firestore Search Engine

This is a powerful and flexible search engine server for Firestore. This package allows developers to quickly and efficiently add search capability to their Firestore-based applications.

Firestore Search Engine Package
This is a powerful and flexible search engine server for Firestore. This package allows developers to quickly and efficiently add search capability to their Firestore-based applications.

## Key Features

- Out-of-the-box Firestore configuration support
- Full-text searching of Firestore documents
- Search by document title
- Pagination capabilities

## Installation

```bash
npm install firestore-search-engine
```

## Usage

Start by importing all the required modules from the package:

```javascript
import FirestoreSearchEngine from "./FirestoreSearchEngine";
import Search from "./Search";
import Indexes from "./Indexes";
```

Then, create an instance of the FirestoreSearchEngine:

```javascript
const searchEngine = new FirestoreSearchEngine(firestore(), {
  collection: "YourCollectionName", //not change collection after indexing or re-indexe all
});
```

After that, call a searchEngine.indexes for index your document:

```javascript
await searchEngine.indexes({
  inputField: inputField,
  returnedFields: {
    indexedDocumentPath:
      "/company/TsqUbTpKgdeUXrclUUIrGaDWLeZ9/submissions/50366", //required field for index only 1 time each document
    name: "ExistingNameKeyInMyDocument", //optional fields you can add the key who you need to be returned in the search result
  },
});
```

Finally, execute the search operation:

```javascript
const results = await searchEngine.search({
  fieldValue: inputField,
}); //That will return all document information who are saved in dexed values
```

The results object will hold the documents that matched your search term.

## Example

Below is a complete usage example of the Firestore Search Engine Package:

```javascript
// index.ts
import FirestoreSearchEngine from "./FirestoreSearchEngine";
app.post("/YourSearchEndPoint", async (request, response) => {
  const { inputField } = JSON.parse(request.body);
  const result = await searchEngine.search({
    fieldValue: inputField,
  });
  response.json(result);
  return;
});
```

## Why Firestore Search Engine?

Firestore is a powerful, serverless solution provided by Google Cloud Platform for your data storage needs. Yet it does not come with a full-text search feature. Firestore Search Engine package gives you the ability to provide your application with a powerful search feature without significant coding effort. With its easy configuration and extensive documentation, the Firestore Search Engine package is a great choice for empowering your Firestore-based applications with full-text search capabilities.

Please read our documentation carefully to understand how to best utilise Firestore Search Engine in your project and feel free to raise any issues or feature requests.
