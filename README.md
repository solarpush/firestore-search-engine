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
- Use [**Vector query**](https://firebase.google.com/docs/firestore/vector-search) from firestore vector embeded for better performances
- Use [**sentence_transformers model**](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- Use [**FastEmbeded for interact with model**](https://www.npmjs.com/package/fastembed)

---

---

**<span style="color: red">Warning:</span>** add the model is injected in /src/cache for the first call is download.
**You need to generate cache in emulator before deploying**
GCP not Allow container to write in functions folder
Also you can fork the repo and re-build with another path in /tmp if you have minInstances deployed and you not need cold start and scaling.

For cloud functions implementation on prod it's recommended to create a separated repository and a new firebase init with only this function and the model in src/cache folder in the same firebase project. This is because the model is large(80+Mb) and can cause deployment issues and cost if it is included in the main repository.

Also upgrade memory of cloud functions from 256MB to 512MB or 1GB for better performances and avoid out of memory errors.

##### For more informations : [Firebase docs about organize-functions](https://firebase.google.com/docs/functions/organize-functions)

---

---

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
  collection: "YourCollectionName", // or sub collection is "YourCollectionName/YourDocumentName/YourSubCollectionName"
  wordMaxLength: 100, //optional default 100
  wordMinLength: 3, //optional default 3
  distanceThreshold: 0.155 /*GLOBAL Specifies the threshold for distance calculation.  
  The value must be a floating-point number between 0 (exclusive) and 1 (exclusive).*/,
}); //not change config after indexing or re-indexe all befor use the search feature

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

**IMPORTANT**
Before the search use you need to create indexes the search functions throw in http 400 with error.code = 9 and details including the custom command to deploy the normalized index field :
[Install gcloud](https://cloud.google.com/sdk/docs/install?hl=fr)
[Configure gcloud](https://cloud.google.com/sdk/docs/initializing?hl=fr)

Or in your [GCP console](https://console.cloud.google.com/) open cloud shell

```json
{
  "code": 9,
  "details": "Missing vector index configuration. Please create the required index with the following gcloud command:
  gcloud firestore indexes composite create --collection-group=<YourCollectionConfig> --query-scope=COLLECTION_GROUP --field-config=field-path=vectors,vector-config='{"dimension":384,"flat": {}}'",
  "metadata": {
    ...
  }
}
//just copy command and use in terminal after gloud login and project select

//Or add in your firestore.indexes.json
"indexes": [
  //...oldIndexes,
    {
      "collectionGroup": "<YourCollectionConfig>",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        {
          "fieldPath": "vectors",//required
          "vectorConfig": {
            "dimension": 384,
            "flat": {}
          }
        }
      ]
    }
  ],

  //and deploy
```

Finally, execute the search operation:

```javascript
const results = await searchEngineUserName.search({
  fieldValue: inputField,
  distanceThreshold: 0.155 /*OVERRIDE GLOBAL Specifies the threshold for distance calculation.  The value must be a floating-point number between 0 (exclusive) and 1 (exclusive).*/,
  limit: 10 /*Limit of documents returnedin response*/,
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
searchEngineUserName.expressWrapper(app, "/search/user/name", {
  distanceThreshold: 0.155 /*OVERRIDE GLOBAL Specifies the threshold for distance calculation.  The value must be a floating-point number between 0 (exclusive) and 1 (exclusive).*/,
  limit: 10 /*Limit of documents returnedin response*/,
}); //add optional second parmateters to change the default path "/search" to your custom path
//url :`yourBaseUrl/search/${inputValue}`
//method :GET
```

### onRequest wrapper

```javascript
import { FirestoreSearchEngine } from "firestore-search-engine";

export const searchUserName = onRequest(
  { region: "europe-west3" },
  searchEngineUserName.onRequestWrapped({
    distanceThreshold: 0.155 /*OVERRIDE GLOBAL Specifies the threshold for distance calculation.  The value must be a floating-point number between 0 (exclusive) and 1 (exclusive).*/,
    limit: 10 /*Limit of documents returnedin response*/,
  })
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
  searchEngineUserName.onCallWrapped(authCallback, {
    distanceThreshold: 0.155 /*OVERRIDE GLOBAL Specifies the threshold for distance calculation.  The value must be a floating-point number between 0 (exclusive) and 1 (exclusive).*/,
    limit: 10 /*Limit of documents returnedin response*/,
  })
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

## Next Steps

- Fix types for cjs types
- Add support of GPU (cuda)
- Add metrics in stress test in GCP
- Rewrite handler in Go and start build-in Firestore extenssion from fields configurations
- Use onnxruntime directly without dependency (fastembeded)
