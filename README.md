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
const searchEngine = new FirestoreSearchEngine();
```

After that, create a Search instance by providing it with the searchEngine, index and the term you want to search for:

```javascript
const search = new Search(searchEngine, Indexes.name, "John");
```

Finally, execute the search operation:

```javascript
const results = await search.execute();
```

The results object will hold the documents that matched your search term.

## Example

Below is a complete usage example of the Firestore Search Engine Package:

```javascript
// index.ts
import FirestoreSearchEngine from "./FirestoreSearchEngine";
import Search from "./Search";
import Indexes from "./Indexes";

(async function () {
  const searchEngine = new FirestoreSearchEngine();
  const search = new Search(searchEngine, Indexes.name, "John");
  const results = await search.execute();

  console.log(results); // prints search results
})();
```

## Why Firestore Search Engine?

Firestore is a powerful, serverless solution provided by Google Cloud Platform for your data storage needs. Yet it does not come with a full-text search feature. Firestore Search Engine package gives you the ability to provide your application with a powerful search feature without significant coding effort. With its easy configuration and extensive documentation, the Firestore Search Engine package is a great choice for empowering your Firestore-based applications with full-text search capabilities.

Please read our documentation carefully to understand how to best utilise Firestore Search Engine in your project and feel free to raise any issues or feature requests.
