"use strict";class e{constructor(e,t,s){this.firestoreInstance=e,this.config=t,this.props=s}async execute(){const e=function(e,t=30){var s,n;if(e.length>t)throw new Error("Input up to 50 Char");const r=new Set,i=[4,5,6],o={a:["z","q","s"],z:["a","e","s"],e:["z","r","d"],r:["e","t","f"],t:["r","y","g"],y:["t","u","h"],u:["y","i","j"],i:["u","o","k"],o:["i","p","l"],p:["o","m"],q:["a","s","w"],s:["a","z","d","q"],d:["s","e","f"],f:["d","r","g"],g:["f","t","h"],h:["g","y","j"],j:["h","u","k"],k:["j","i","l"],l:["k","o","m"],m:["l","p"]};for(const t of i)for(let i=0;i<=e.length-t;i++){const c=e.slice(i,i+t);if(c.length>=3){const e=c[0];o[e]&&o[e].forEach((e=>{const t=e+c.slice(1);r.add(t)})),null===(s=o[e])||void 0===s||s.forEach((e=>{const t=e+c;r.add(t)})),r.add(c.slice(1))}const a=c[c.length-1];c.length>=3&&o[a]&&(o[a].forEach((e=>{const t=c.slice(0,-1)+e;r.add(t)})),null===(n=o[a])||void 0===n||n.forEach((e=>{const t=c+e;r.add(t)})),r.add(c.slice(0,-1)))}return r}(this.props.inputField,this.props.wordMaxLength);return await this.saveWithLimitedKeywords(this.props.returnedFields,Array.from(e))}async saveWithLimitedKeywords(e,t){const s=this.firestoreInstance.bulkWriter();await this.cleanOldIndexes(e,s);const n=[];for(let e=0;e<t.length;e+=800)n.push(t.slice(e,e+800));for(let t=0;t<n.length;t++)s.create(this.firestoreInstance.collection(this.config.collection).doc(),{search_keywords:n[t],...e}),t%500==0&&await s.flush();await s.close()}async cleanOldIndexes(e,t){const{indexedDocumentPath:s}=e,n=await this.firestoreInstance.collection(this.config.collection).where("indexedDocumentPath","==",s).get();if(!n.empty){for(let e=0;e<n.docs.length;e++)t.delete(n.docs[e].ref),e%500==0&&await t.flush();await t.flush()}}}function t(e,t){const s=Array.from({length:e.length+1},((e,s)=>[s,...Array(t.length).fill(0)]));for(let e=0;e<=t.length;e++)s[0][e]=e;for(let n=1;n<=e.length;n++)for(let r=1;r<=t.length;r++){const i=e[n-1]===t[r-1]?0:1;s[n][r]=Math.min(s[n-1][r]+1,s[n][r-1]+1,s[n-1][r-1]+i)}return s[e.length][t.length]}class s{constructor(e,t,s){this.firestoreInstance=e,this.config=t,this.props=s}async execute(){return await this.search(this.props.fieldValue)}async search(e){const s=function(e,t=3,s=8){const n=[];e.split(" ").forEach((e=>{for(let r=1;r<=Math.min(e.trim().length,s);r++)r<=t||n.push(e.trim().substring(0,r).toLowerCase())}));for(let r=1;r<=Math.min(e.length,s);r++)r<=t||n.push(e.substring(0,r).toLowerCase());return n}(e),n=await this.firestoreInstance.collection(this.config.collection).where("search_keywords","array-contains-any",[...s]).get();if(n.empty)return[];const r=new Set,i=[];for(const s of n.docs){const n=s.data(),{search_keywords:o,...c}=n,a=n.indexedDocumentPath;o.some((s=>e.split(" ").some((e=>t(e,s)<=2))))&&!r.has(a)&&(r.add(a),i.push(c))}return i}}exports.FirestoreSearchEngine=class{constructor(e,t){if(this.firestoreInstance=e,this.config=t,this.firestoreInstance.settings({ignoreUndefinedProperties:!0}),this.config.collection.length<1)throw new Error("collectionName is required and must be a non-empty string.")}async search(e){if("string"!=typeof e.fieldValue||0===e.fieldValue.length)throw new Error("fieldValue is required and must be a non-empty string.");return await new s(this.firestoreInstance,this.config,e).execute()}async indexes(t){if("string"!=typeof t.inputField||0===t.inputField.length)throw new Error("fieldValue is required and must be a non-empty string.");return await new e(this.firestoreInstance,this.config,t).execute()}};
//# sourceMappingURL=index.cjs.map
