(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const X=function(){return typeof process<"u"&&process.release?.name==="node"?"NODE":typeof window<"u"?"WEB":typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?"WORKER":"NODE"}();if(X==="NODE"){let e=function(n){return new Promise(function(r,s){n.onload=n.onerror=function(i){n.onload=n.onerror=null,i.type==="load"?r(n.result):s(new Error("Failed to read the blob/file"))}})},t=function(){const n=new Uint8Array([1,2,3,4]),s=new File([n],"test").stream();try{return s.getReader({mode:"byob"}),!0}catch{return!1}};if(typeof File>"u"){class n extends Blob{constructor(s,i,o){super(s);let c;o?.lastModified&&(c=new Date),(!c||isNaN(c.getFullYear()))&&(c=new Date),this.lastModifiedDate=c,this.lastModified=c.getMilliseconds(),this.name=i||""}}global.File=n}typeof Blob.prototype.arrayBuffer>"u"&&(Blob.prototype.arrayBuffer=function(){const r=new FileReader;return r.readAsArrayBuffer(this),e(r)}),typeof Blob.prototype.text>"u"&&(Blob.prototype.text=function(){const r=new FileReader;return r.readAsText(this),e(r)}),(typeof Blob.prototype.stream>"u"||!t())&&(Blob.prototype.stream=function(){let n=0;const r=this;return new ReadableStream({type:"bytes",autoAllocateChunkSize:512*1024,async pull(s){const i=s.byobRequest.view,c=await r.slice(n,n+i.byteLength).arrayBuffer(),l=new Uint8Array(c);new Uint8Array(i.buffer).set(l);const a=l.byteLength;s.byobRequest.respond(a),n+=a,n>=r.size&&s.close()}})})}if(X==="NODE"&&typeof CustomEvent>"u"){class e extends Event{constructor(n,r={}){super(n,r),this.detail=r.detail}initCustomEvent(){}}globalThis.CustomEvent=e}const x={0:"No error occurred. System call completed successfully.",1:"Argument list too long.",2:"Permission denied.",3:"Address in use.",4:"Address not available.",5:"Address family not supported.",6:"Resource unavailable, or operation would block.",7:"Connection already in progress.",8:"Bad file descriptor.",9:"Bad message.",10:"Device or resource busy.",11:"Operation canceled.",12:"No child processes.",13:"Connection aborted.",14:"Connection refused.",15:"Connection reset.",16:"Resource deadlock would occur.",17:"Destination address required.",18:"Mathematics argument out of domain of function.",19:"Reserved.",20:"File exists.",21:"Bad address.",22:"File too large.",23:"Host is unreachable.",24:"Identifier removed.",25:"Illegal byte sequence.",26:"Operation in progress.",27:"Interrupted function.",28:"Invalid argument.",29:"I/O error.",30:"Socket is connected.",31:"There is a directory under that path.",32:"Too many levels of symbolic links.",33:"File descriptor value too large.",34:"Too many links.",35:"Message too large.",36:"Reserved.",37:"Filename too long.",38:"Network is down.",39:"Connection aborted by network.",40:"Network unreachable.",41:"Too many files open in system.",42:"No buffer space available.",43:"No such device.",44:"There is no such file or directory OR the parent directory does not exist.",45:"Executable file format error.",46:"No locks available.",47:"Reserved.",48:"Not enough space.",49:"No message of the desired type.",50:"Protocol not available.",51:"No space left on device.",52:"Function not supported.",53:"The socket is not connected.",54:"Not a directory or a symbolic link to a directory.",55:"Directory not empty.",56:"State not recoverable.",57:"Not a socket.",58:"Not supported, or operation not supported on socket.",59:"Inappropriate I/O control operation.",60:"No such device or address.",61:"Value too large to be stored in data type.",62:"Previous owner died.",63:"Operation not permitted.",64:"Broken pipe.",65:"Protocol error.",66:"Protocol not supported.",67:"Protocol wrong type for socket.",68:"Result too large.",69:"Read-only file system.",70:"Invalid seek.",71:"No such process.",72:"Reserved.",73:"Connection timed out.",74:"Text file busy.",75:"Cross-device link.",76:"Extension: Capabilities insufficient."};function Pe(e){const t=typeof e=="object"?e?.errno:null;if(t in x)return x[t]}function _(e=""){return function(n,r,s){const i=s.value;s.value=function(...o){try{return i.apply(this,o)}catch(c){const l=typeof c=="object"?c?.errno:null;if(l in x){const a=x[l],u=typeof o[1]=="string"?o[1]:null,d=u!==null?e.replaceAll("{path}",u):e;throw new Error(`${d}: ${a}`,{cause:c})}throw c}}}}const Se="playground-log",Q=(e,...t)=>{E.dispatchEvent(new CustomEvent(Se,{detail:{log:e,args:t}}))},xe=(e,...t)=>{switch(typeof e.message=="string"?Reflect.set(e,"message",D(e.message)):e.message.message&&typeof e.message.message=="string"&&Reflect.set(e.message,"message",D(e.message.message)),e.severity){case"Debug":console.debug(e.message,...t);break;case"Info":console.info(e.message,...t);break;case"Warn":console.warn(e.message,...t);break;case"Error":console.error(e.message,...t);break;case"Fatal":console.error(e.message,...t);break;default:console.log(e.message,...t)}},Re=e=>e instanceof Error?[e.message,e.stack].join(`
`):JSON.stringify(e,null,2),ee=[],V=e=>{ee.push(e)},N=e=>{if(e.raw===!0)V(e.message);else{const t=Ie(typeof e.message=="object"?Re(e.message):e.message,e.severity??"Info",e.prefix??"JavaScript");V(t)}};class Ce extends EventTarget{constructor(t=[]){super(),this.handlers=t,this.fatalErrorEvent="playground-fatal-error"}getLogs(){return this.handlers.includes(N)?[...ee]:(this.error(`Logs aren't stored because the logToMemory handler isn't registered.
				If you're using a custom logger instance, make sure to register logToMemory handler.
			`),[])}logMessage(t,...n){for(const r of this.handlers)r(t,...n)}log(t,...n){this.logMessage({message:t,severity:void 0,prefix:"JavaScript",raw:!1},...n)}debug(t,...n){this.logMessage({message:t,severity:"Debug",prefix:"JavaScript",raw:!1},...n)}info(t,...n){this.logMessage({message:t,severity:"Info",prefix:"JavaScript",raw:!1},...n)}warn(t,...n){this.logMessage({message:t,severity:"Warn",prefix:"JavaScript",raw:!1},...n)}error(t,...n){this.logMessage({message:t,severity:"Error",prefix:"JavaScript",raw:!1},...n)}}const Le=()=>{try{if(process.env.NODE_ENV==="test")return[N,Q]}catch{}return[N,xe,Q]},E=new Ce(Le()),D=e=>e.replace(/\t/g,""),Ie=(e,t,n)=>{const r=new Date,s=new Intl.DateTimeFormat("en-GB",{year:"numeric",month:"short",day:"2-digit",timeZone:"UTC"}).format(r).replace(/ /g,"-"),i=new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1,timeZone:"UTC",timeZoneName:"short"}).format(r),o=s+" "+i;return e=D(e),`[${o}] ${n} ${t}: ${e}`};class M extends Error{constructor(t,n){super(t),this.userFriendlyMessage=n,this.userFriendlyMessage||(this.userFriendlyMessage=t)}}function f(...e){function t(i){return i.substring(i.length-1)==="/"}let n=e.join("/");const r=n[0]==="/",s=t(n);return n=ne(n),!n&&!r&&(n="."),n&&s&&!t(n)&&(n+="/"),n}function te(e){if(e==="/")return"/";e=ne(e);const t=e.lastIndexOf("/");return t===-1?"":t===0?"/":e.substr(0,t)}function ne(e){const t=e[0]==="/";return e=Oe(e.split("/").filter(n=>!!n),!t).join("/"),(t?"/":"")+e.replace(/\/$/,"")}function Oe(e,t){let n=0;for(let r=e.length-1;r>=0;r--){const s=e[r];s==="."?e.splice(r,1):s===".."?(e.splice(r,1),n++):n&&(e.splice(r,1),n--)}if(t)for(;n;n--)e.unshift("..");return e}function re(e=36,t="!@#$%^&*()_+=-[]/.,<>?"){const n="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"+t;let r="";for(let s=e;s>0;--s)r+=n[Math.floor(Math.random()*n.length)];return r}function Ae(){return re(36,"-_")}function h(e){return`json_decode(base64_decode('${Fe(JSON.stringify(e))}'), true)`}function O(e){const t={};for(const n in e)t[n]=h(e[n]);return t}function Fe(e){return We(new TextEncoder().encode(e))}function We(e){const t=String.fromCodePoint(...e);return btoa(t)}var Ne=Object.defineProperty,De=Object.getOwnPropertyDescriptor,g=(e,t,n,r)=>{for(var s=r>1?void 0:r?De(t,n):t,i=e.length-1,o;i>=0;i--)(o=e[i])&&(s=(r?o(t,n,s):o(s))||s);return r&&s&&Ne(t,n,s),s};const y=class w{static readFileAsText(t,n){return new TextDecoder().decode(w.readFileAsBuffer(t,n))}static readFileAsBuffer(t,n){return t.readFile(n)}static writeFile(t,n,r){t.writeFile(n,r)}static unlink(t,n){t.unlink(n)}static mv(t,n,r){try{const s=t.lookupPath(n).node.mount,i=w.fileExists(t,r)?t.lookupPath(r).node.mount:t.lookupPath(te(r)).node.mount;s.mountpoint!==i.mountpoint?(w.copyRecursive(t,n,r),w.rmdir(t,n,{recursive:!0})):t.rename(n,r)}catch(s){const i=Pe(s);throw i?new Error(`Could not move ${n} to ${r}: ${i}`,{cause:s}):s}}static rmdir(t,n,r={recursive:!0}){r?.recursive&&w.listFiles(t,n).forEach(s=>{const i=`${n}/${s}`;w.isDir(t,i)?w.rmdir(t,i,r):w.unlink(t,i)}),t.rmdir(n)}static listFiles(t,n,r={prependPath:!1}){if(!w.fileExists(t,n))return[];try{const s=t.readdir(n).filter(i=>i!=="."&&i!=="..");if(r.prependPath){const i=n.replace(/\/$/,"");return s.map(o=>`${i}/${o}`)}return s}catch(s){return E.error(s,{path:n}),[]}}static isDir(t,n){return w.fileExists(t,n)?t.isDir(t.lookupPath(n,{follow:!0}).node.mode):!1}static isFile(t,n){return w.fileExists(t,n)?t.isFile(t.lookupPath(n,{follow:!0}).node.mode):!1}static symlink(t,n,r){return t.symlink(n,r)}static isSymlink(t,n){return w.fileExists(t,n)?t.isLink(t.lookupPath(n).node.mode):!1}static readlink(t,n){return t.readlink(n)}static realpath(t,n){return t.lookupPath(n,{follow:!0}).path}static fileExists(t,n){try{return t.lookupPath(n),!0}catch{return!1}}static mkdir(t,n){t.mkdirTree(n)}static copyRecursive(t,n,r){const s=t.lookupPath(n).node;if(t.isDir(s.mode)){t.mkdirTree(r);const i=t.readdir(n).filter(o=>o!=="."&&o!=="..");for(const o of i)w.copyRecursive(t,f(n,o),f(r,o))}else t.writeFile(r,t.readFile(n))}};g([_('Could not read "{path}"')],y,"readFileAsText",1);g([_('Could not read "{path}"')],y,"readFileAsBuffer",1);g([_('Could not write to "{path}"')],y,"writeFile",1);g([_('Could not unlink "{path}"')],y,"unlink",1);g([_('Could not remove directory "{path}"')],y,"rmdir",1);g([_('Could not list files in "{path}"')],y,"listFiles",1);g([_('Could not stat "{path}"')],y,"isDir",1);g([_('Could not stat "{path}"')],y,"isFile",1);g([_('Could not stat "{path}"')],y,"realpath",1);g([_('Could not stat "{path}"')],y,"fileExists",1);g([_('Could not create directory "{path}"')],y,"mkdir",1);g([_('Could not copy files from "{path}"')],y,"copyRecursive",1);const Me={500:"Internal Server Error",502:"Bad Gateway",404:"Not Found",403:"Forbidden",401:"Unauthorized",400:"Bad Request",301:"Moved Permanently",302:"Found",307:"Temporary Redirect",308:"Permanent Redirect",204:"No Content",201:"Created",200:"OK"};class R{constructor(t,n,r,s="",i=0){this.httpStatusCode=t,this.headers=n,this.bytes=r,this.exitCode=i,this.errors=s}static forHttpCode(t,n=""){return new R(t,{},new TextEncoder().encode(n||Me[t]||""))}static fromRawData(t){return new R(t.httpStatusCode,t.headers,t.bytes,t.errors,t.exitCode)}toRawData(){return{headers:this.headers,bytes:this.bytes,errors:this.errors,exitCode:this.exitCode,httpStatusCode:this.httpStatusCode}}get json(){return JSON.parse(this.text)}get text(){return new TextDecoder().decode(this.bytes)}}(function(){return typeof process<"u"&&process.release?.name==="node"?"NODE":typeof window<"u"?"WEB":typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?"WORKER":"NODE"})();ReadableStream.prototype[Symbol.asyncIterator]||(ReadableStream.prototype[Symbol.asyncIterator]=async function*(){const e=this.getReader();try{for(;;){const{done:t,value:n}=await e.read();if(t)return;yield n}}finally{e.releaseLock()}},ReadableStream.prototype.iterate=ReadableStream.prototype[Symbol.asyncIterator]);/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const se=Symbol("Comlink.proxy"),Ue=Symbol("Comlink.endpoint"),Be=Symbol("Comlink.releaseProxy"),F=Symbol("Comlink.finalizer"),S=Symbol("Comlink.thrown"),ie=e=>typeof e=="object"&&e!==null||typeof e=="function",ze={canHandle:e=>ie(e)&&e[se],serialize(e){const{port1:t,port2:n}=new MessageChannel;return A(e,t),[n,[n]]},deserialize(e){return e.start(),q(e)}},qe={canHandle:e=>ie(e)&&S in e,serialize({value:e}){let t;return e instanceof Error?t={isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:t={isError:!1,value:e},[t,[]]},deserialize(e){throw e.isError?Object.assign(new Error(e.value.message),e.value):e.value}},v=new Map([["proxy",ze],["throw",qe]]);function Ge(e,t){for(const n of e)if(t===n||n==="*"||n instanceof RegExp&&n.test(t))return!0;return!1}function A(e,t=globalThis,n=["*"]){t.addEventListener("message",function r(s){if(!s||!s.data)return;if(!Ge(n,s.origin)){console.warn(`Invalid origin '${s.origin}' for comlink proxy`);return}const{id:i,type:o,path:c}=Object.assign({path:[]},s.data),l=(s.data.argumentList||[]).map(b);let a;try{const u=c.slice(0,-1).reduce((p,m)=>p[m],e),d=c.reduce((p,m)=>p[m],e);switch(o){case"GET":a=d;break;case"SET":u[c.slice(-1)[0]]=b(s.data.value),a=!0;break;case"APPLY":a=d.apply(u,l);break;case"CONSTRUCT":{const p=new d(...l);a=le(p)}break;case"ENDPOINT":{const{port1:p,port2:m}=new MessageChannel;A(e,m),a=Je(p,[p])}break;case"RELEASE":a=void 0;break;default:return}}catch(u){a={value:u,[S]:0}}Promise.resolve(a).catch(u=>({value:u,[S]:0})).then(u=>{const[d,p]=I(u);t.postMessage(Object.assign(Object.assign({},d),{id:i}),p),o==="RELEASE"&&(t.removeEventListener("message",r),oe(t),F in e&&typeof e[F]=="function"&&e[F]())}).catch(u=>{const[d,p]=I({value:new TypeError("Unserializable return value"),[S]:0});t.postMessage(Object.assign(Object.assign({},d),{id:i}),p)})}),t.start&&t.start()}function He(e){return e.constructor.name==="MessagePort"}function oe(e){He(e)&&e.close()}function q(e,t){return U(e,[],t)}function P(e){if(e)throw new Error("Proxy has been released and is not useable")}function ae(e){return k(e,{type:"RELEASE"}).then(()=>{oe(e)})}const C=new WeakMap,L="FinalizationRegistry"in globalThis&&new FinalizationRegistry(e=>{const t=(C.get(e)||0)-1;C.set(e,t),t===0&&ae(e)});function je(e,t){const n=(C.get(t)||0)+1;C.set(t,n),L&&L.register(e,t,e)}function Qe(e){L&&L.unregister(e)}function U(e,t=[],n=function(){}){let r=!1;const s=new Proxy(n,{get(i,o){if(P(r),o===Be)return()=>{Qe(s),ae(e),r=!0};if(o==="then"){if(t.length===0)return{then:()=>s};const c=k(e,{type:"GET",path:t.map(l=>l.toString())}).then(b);return c.then.bind(c)}return U(e,[...t,o])},set(i,o,c){P(r);const[l,a]=I(c);return k(e,{type:"SET",path:[...t,o].map(u=>u.toString()),value:l},a).then(b)},apply(i,o,c){P(r);const l=t[t.length-1];if(l===Ue)return k(e,{type:"ENDPOINT"}).then(b);if(l==="bind")return U(e,t.slice(0,-1));const[a,u]=J(c);return k(e,{type:"APPLY",path:t.map(d=>d.toString()),argumentList:a},u).then(b)},construct(i,o){P(r);const[c,l]=J(o);return k(e,{type:"CONSTRUCT",path:t.map(a=>a.toString()),argumentList:c},l).then(b)}});return je(s,e),s}function Ve(e){return Array.prototype.concat.apply([],e)}function J(e){const t=e.map(I);return[t.map(n=>n[0]),Ve(t.map(n=>n[1]))]}const ce=new WeakMap;function Je(e,t){return ce.set(e,t),e}function le(e){return Object.assign(e,{[se]:!0})}function ue(e,t=globalThis,n="*"){return{postMessage:(r,s)=>e.postMessage(r,n,s),addEventListener:t.addEventListener.bind(t),removeEventListener:t.removeEventListener.bind(t)}}function I(e){for(const[t,n]of v)if(n.canHandle(e)){const[r,s]=n.serialize(e);return[{type:"HANDLER",name:t,value:r},s]}return[{type:"RAW",value:e},ce.get(e)||[]]}function b(e){switch(e.type){case"HANDLER":return v.get(e.name).deserialize(e.value);case"RAW":return e.value}}function k(e,t,n){return new Promise(r=>{const s=Ye();e.addEventListener("message",function i(o){!o.data||!o.data.id||o.data.id!==s||(e.removeEventListener("message",i),r(o.data))}),e.start&&e.start(),e.postMessage(Object.assign({id:s},t),n)})}function Ye(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}function Ke(e,t=void 0){de();const n=e instanceof Worker?e:ue(e,t),r=q(n),s=G(r);return new Proxy(s,{get:(i,o)=>o==="isConnected"?async()=>{for(;;)try{await Ze(r.isConnected(),200);break}catch{}}:r[o]})}async function Ze(e,t){return new Promise((n,r)=>{setTimeout(r,t),e.then(n)})}function Xe(e,t){de();const n=Promise.resolve();let r,s;const i=new Promise((l,a)=>{r=l,s=a}),o=G(e),c=new Proxy(o,{get:(l,a)=>a==="isConnected"?()=>n:a==="isReady"?()=>i:a in l?l[a]:t?.[a]});return A(c,typeof window<"u"?ue(self.parent):void 0),[r,s,c]}let Y=!1;function de(){if(Y)return;Y=!0,v.set("EVENT",{canHandle:n=>n instanceof CustomEvent,serialize:n=>[{detail:n.detail},[]],deserialize:n=>n}),v.set("FUNCTION",{canHandle:n=>typeof n=="function",serialize(n){const{port1:r,port2:s}=new MessageChannel;return A(n,r),[s,[s]]},deserialize(n){return n.start(),q(n)}}),v.set("PHPResponse",{canHandle:n=>typeof n=="object"&&n!==null&&"headers"in n&&"bytes"in n&&"errors"in n&&"exitCode"in n&&"httpStatusCode"in n,serialize(n){return[n.toRawData(),[]]},deserialize(n){return R.fromRawData(n)}});const e=v.get("throw"),t=e?.serialize;e.serialize=({value:n})=>{const r=t({value:n});return n.response&&(r[0].value.response=n.response),n.source&&(r[0].value.source=n.source),r}}function G(e){return new Proxy(e,{get(t,n){switch(typeof t[n]){case"function":return(...r)=>t[n](...r);case"object":return t[n]===null?t[n]:G(t[n]);case"undefined":case"number":case"string":return t[n];default:return le(t[n])}}})}function et(e,t){return{type:"response",requestId:e,response:t}}function pe(e){return e.pathname.startsWith("/scope:")}function tt(e){return pe(e)?e.pathname.split("/")[1].split(":")[1]:null}let fe;const nt=new Promise(e=>{fe=e});function rt(e){if(!e)throw new M("PHP API client must be a valid client object.");fe(e)}async function st(e,t){const n=navigator.serviceWorker;if(!n)throw window.isSecureContext?new M("Service workers are not supported in your browser."):new M("WordPress Playground uses service workers and may only work on HTTPS and http://localhost/ sites, but the current site is neither.");const r=await n.register(t,{type:"module",updateViaCache:"none"});try{await r.update()}catch(s){E.error("Failed to update service worker.",s)}navigator.serviceWorker.addEventListener("message",async function(i){if(e&&i.data.scope!==e)return;const o=await nt,c=i.data.args||[],l=i.data.method,a=await o[l](...c);i.source.postMessage(et(i.data.requestId,a))}),n.startMessages()}function it(e,t){window.addEventListener("message",n=>{n.source===e.contentWindow&&(t&&n.origin!==t||typeof n.data!="object"||n.data.type!=="relay"||window.parent.postMessage(n.data,"*"))}),window.addEventListener("message",n=>{n.source===window.parent&&(typeof n.data!="object"||n.data.type!=="relay"||e?.contentWindow?.postMessage(n.data))})}async function ot(e){const t=new Worker(e,{type:"module"});return new Promise((n,r)=>{t.onerror=i=>{const o=new Error(`WebWorker failed to load at ${e}. ${i.message?`Original error: ${i.message}`:""}`);o.filename=i.filename,r(o)};function s(i){i.data==="worker-script-started"&&(n(t),t.removeEventListener("message",s))}t.addEventListener("message",s)})}const at="_overlay_1571u_1",ct="_is-hidden_1571u_17",lt="_wrapper_1571u_22",ut="_wrapper-definite_1571u_32",dt="_progress-bar_1571u_32",pt="_is-indefinite_1571u_32",ft="_wrapper-indefinite_1571u_33",ht="_is-definite_1571u_33",mt="_indefinite-loading_1571u_1",wt="_caption_1571u_81",$={overlay:at,isHidden:ct,wrapper:lt,wrapperDefinite:ut,progressBar:dt,isIndefinite:pt,wrapperIndefinite:ft,isDefinite:ht,indefiniteLoading:mt,caption:wt};class $t{constructor(t={}){this.caption="Preparing WordPress",this.progress=0,this.isIndefinite=!1,this.visible=!0,this.element=document.createElement("div"),this.captionElement=document.createElement("h3"),this.element.appendChild(this.captionElement),this.setOptions(t)}setOptions(t){"caption"in t&&t.caption&&(this.caption=t.caption),"progress"in t&&(this.progress=t.progress),"isIndefinite"in t&&(this.isIndefinite=t.isIndefinite),"visible"in t&&(this.visible=t.visible),this.updateElement()}destroy(){this.setOptions({visible:!1}),setTimeout(()=>{this.element.remove()},500)}updateElement(){this.element.className="",this.element.classList.add($.overlay),this.visible||this.element.classList.add($.isHidden),this.captionElement.className="",this.captionElement.classList.add($.caption),this.captionElement.textContent=this.caption+"...";const t=this.element.querySelector(`.${$.wrapper}`);t&&this.element.removeChild(t),this.isIndefinite?this.element.appendChild(this.createProgressIndefinite()):this.element.appendChild(this.createProgress())}createProgress(){const t=document.createElement("div");t.classList.add($.wrapper,$.wrapperDefinite);const n=document.createElement("div");return n.classList.add($.progressBar,$.isDefinite),n.style.width=this.progress+"%",t.appendChild(n),t}createProgressIndefinite(){const t=document.createElement("div");t.classList.add($.wrapper,$.wrapperIndefinite);const n=document.createElement("div");return n.classList.add($.progressBar,$.isIndefinite),t.appendChild(n),t}}const _t="/worker-thread-5f356f6b.js",gt="/sw.js",he=["db.php","plugins/akismet","plugins/hello.php","plugins/wordpress-importer","mu-plugins/sqlite-database-integration","mu-plugins/playground-includes","mu-plugins/0-playground.php","mu-plugins/0-sqlite.php","themes/twentytwenty","themes/twentytwentyone","themes/twentytwentytwo","themes/twentytwentythree","themes/twentytwentyfour","themes/twentytwentyfive","themes/twentytwentysix"],H=async(e,{pluginPath:t,pluginName:n},r)=>{r?.tracker.setCaption(`Activating ${n||t}`);const s=await e.documentRoot,i=await e.run({code:`<?php
			define( 'WP_ADMIN', true );
			require_once( ${h(s)}. "/wp-load.php" );
			require_once( ${h(s)}. "/wp-admin/includes/plugin.php" );

			// Set current user to admin
			wp_set_current_user( get_users(array('role' => 'Administrator') )[0]->ID );

			$plugin_path = ${h(t)};
			$response = false;
			if (!is_dir($plugin_path)) {
				$response = activate_plugin($plugin_path);
			}

			// Activate plugin by name if activation by path wasn't successful
			if ( null !== $response ) {
				foreach ( ( glob( $plugin_path . '/*.php' ) ?: array() ) as $file ) {
					$info = get_plugin_data( $file, false, false );
					if ( ! empty( $info['Name'] ) ) {
						$response = activate_plugin( $file );
						break;
					}
				}
			}

			if ( null === $response ) {
				die('Plugin activated successfully');
			} else if ( is_wp_error( $response ) ) {
				throw new Exception( $response->get_error_message() );
			}

			throw new Exception( 'Unable to activate plugin' );
		`});if(i.text!=="Plugin activated successfully")throw E.debug(i),new Error(`Plugin ${t} could not be activated – WordPress exited with no error. Sometimes, when $_SERVER or site options are not configured correctly, WordPress exits early with a 301 redirect. Inspect the "debug" logs in the console for more details`)},me=async(e,{themeFolderName:t},n)=>{n?.tracker.setCaption(`Activating ${t}`);const r=await e.documentRoot,s=`${r}/wp-content/themes/${t}`;if(!await e.fileExists(s))throw new Error(`
			Couldn't activate theme ${t}.
			Theme not found at the provided theme path: ${s}.
			Check the theme path to ensure it's correct.
			If the theme is not installed, you can install it using the installTheme step.
			More info can be found in the Blueprint documentation: https://wordpress.github.io/wordpress-playground/blueprints/steps/#ActivateThemeStep
		`);const i=await e.run({code:`<?php
			define( 'WP_ADMIN', true );
			require_once( getenv('docroot') . "/wp-load.php" );

			// Set current user to admin
			wp_set_current_user( get_users(array('role' => 'Administrator') )[0]->ID );

			switch_theme( getenv('themeFolderName') );

			if( wp_get_theme()->get_stylesheet() !== getenv('themeFolderName') ) {
				throw new Exception( 'Theme ' . getenv('themeFolderName') . ' could not be activated.' );				
			}
			die('Theme activated successfully');
		`,env:{docroot:r,themeFolderName:t}});if(i.text!=="Theme activated successfully")throw E.debug(i),new Error(`Theme ${t} could not be activated – WordPress exited with no error. Sometimes, when $_SERVER or site options are not configured correctly, WordPress exits early with a 301 redirect. Inspect the "debug" logs in the console for more details`)},yt=async(e,{code:t})=>await e.run({code:t}),Et=async(e,{options:t})=>await e.run(t),we=async(e,{path:t})=>{await e.unlink(t)},bt=async(e,{sql:t},n)=>{n?.tracker.setCaption("Executing SQL Queries");const r=`/tmp/${Ae()}.sql`;await e.writeFile(r,new Uint8Array(await t.arrayBuffer()));const s=await e.documentRoot,i=O({docroot:s,sqlFilename:r}),o=await e.run({code:`<?php
		require_once ${i.docroot} . '/wp-load.php';

		$handle = fopen(${i.sqlFilename}, 'r');
		$buffer = '';

		global $wpdb;

		while ($bytes = fgets($handle)) {
			$buffer .= $bytes;

			if (!feof($handle) && substr($buffer, -1, 1) !== "
") {
				continue;
			}

			$wpdb->query($buffer);
			$buffer = '';
		}
	`});return await we(e,{path:r}),o},B=async(e,{request:t})=>{E.warn('Deprecated: The Blueprint step "request" is deprecated and will be removed in a future release.');const n=await e.request(t);if(n.httpStatusCode>399||n.httpStatusCode<200)throw E.warn("WordPress response was",{response:n}),new Error(`Request failed with status ${n.httpStatusCode}`);return n},kt=`<?php

/**
 * Rewrites the wp-config.php file to ensure specific constants are defined
 * with specific values.
 * 
 * Example:
 * 
 * \`\`\`php
 * <?php
 * define('WP_DEBUG', true);
 * // The third define() argument is also supported:
 * define('SAVEQUERIES', false, true);
 * 
 * // Expression
 * define(true ? 'WP_DEBUG_LOG' : 'WP_DEBUG_LOG', 123);
 * 
 * // Guarded expressions shouldn't be wrapped twice
 * if(!defined(1 ? 'A' : 'B')) {
 *     define(1 ? 'A' : 'B', 0);
 * }
 * 
 * // More advanced expression
 * define((function() use($x) {
 *     return [$x, 'a'];
 * })(), 123);
 * \`\`\`
 * 
 * Rewritten with
 * 
 *     $constants = [
 *        'WP_DEBUG' => false,
 *        'WP_DEBUG_LOG' => true,
 *        'SAVEQUERIES' => true,
 *        'NEW_CONSTANT' => "new constant",
 *     ];
 * 
 * \`\`\`php
 * <?php
 * define('WP_DEBUG_LOG',true);
 * define('NEW_CONSTANT','new constant');
 * ?><?php
 * define('WP_DEBUG',false);
 * // The third define() argument is also supported:
 * define('SAVEQUERIES',true, true);
 * 
 * // Expression
 * if(!defined($const ? 'WP_DEBUG_LOG' : 'WP_DEBUG_LOG')) {
 *      define($const ? 'WP_DEBUG_LOG' : 'WP_DEBUG_LOG', 123);
 * }
 * 
 * // Guarded expressions shouldn't be wrapped twice
 * if(!defined(1 ? 'A' : 'B')) {
 *     define(1 ? 'A' : 'B', 0);
 * }
 * 
 * // More advanced expression
 * if(!defined((function() use($x) {
 *    return [$x, 'a'];
 * })())) {
 *     define((function() use($x) {
 *         return [$x, 'a'];
 *     })(), 123);
 * }
 * \`\`\`
 * 
 * @param mixed $content
 * @return string
 */
function rewrite_wp_config_to_define_constants($content, $constants = [])
{
    $tokens = array_reverse(token_get_all($content));
    $output = [];
    $defined_expressions = [];

    // Look through all the tokens and find the define calls
    do {
        $buffer = [];
        $name_buffer = [];
        $value_buffer = [];
        $third_arg_buffer = [];

        // Capture everything until the define call into output.
        // Capturing the define call into a buffer.
        // Example:
        //     <?php echo 'a'; define  (
        //     ^^^^^^^^^^^^^^^^^^^^^^
        //           output   |buffer
        while ($token = array_pop($tokens)) {
            if (is_array($token) && $token[0] === T_STRING && (strtolower($token[1]) === 'define' || strtolower($token[1]) === 'defined')) {
                $buffer[] = $token;
                break;
            }
            $output[] = $token;
        }

        // Maybe we didn't find a define call and reached the end of the file?
        if (!count($tokens)) {
            break;
        }

        // Keep track of the "defined" expressions that are already accounted for
        if($token[1] === 'defined') {
            $output[] = $token;
            $defined_expression = [];
            $open_parenthesis = 0;
            // Capture everything up to the opening parenthesis, including the parenthesis
            // e.g. defined  (
            //           ^^^^
            while ($token = array_pop($tokens)) {
                $output[] = $token;
                if ($token === "(") {
                    ++$open_parenthesis;
                    break;
                }
            }

            // Capture everything up to the closing parenthesis, including the parenthesis
            // e.g. defined  (
            //           ^^^^
            while ($token = array_pop($tokens)) {
                $output[] = $token;
                if ($token === ")") {
                    --$open_parenthesis;
                }
                if ($open_parenthesis === 0) {
                    break;
                }
                $defined_expression[] = $token;
            }

            $defined_expressions[] = stringify_tokens(skip_whitespace($defined_expression));
            continue;
        }

        // Capture everything up to the opening parenthesis, including the parenthesis
        // e.g. define  (
        //           ^^^^
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === "(") {
                break;
            }
        }

        // Capture the first argument – it's the first expression after the opening
        // parenthesis and before the comma:
        // Examples:
        //     define("WP_DEBUG", true);
        //            ^^^^^^^^^^^
        //
        //     define(count([1,2]) > 2 ? 'WP_DEBUG' : 'FOO', true);
        //            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        $open_parenthesis = 0;
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === "(" || $token === "[" || $token === "{") {
                ++$open_parenthesis;
            } elseif ($token === ")" || $token === "]" || $token === "}") {
                --$open_parenthesis;
            } elseif ($token === "," && $open_parenthesis === 0) {
                break;
            }

            // Don't capture the comma as a part of the constant name
            $name_buffer[] = $token;
        }

        // Capture everything until the closing parenthesis
        //     define("WP_DEBUG", true);
        //                       ^^^^^^
        $open_parenthesis = 0;
        $is_second_argument = true;
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === ")" && $open_parenthesis === 0) {
                // Final parenthesis of the define call.
                break;
            } else if ($token === "(" || $token === "[" || $token === "{") {
                ++$open_parenthesis;
            } elseif ($token === ")" || $token === "]" || $token === "}") {
                --$open_parenthesis;
            } elseif ($token === "," && $open_parenthesis === 0) {
                // This define call has more than 2 arguments! The third one is the
                // boolean value indicating $is_case_insensitive. Let's continue capturing
                // to $third_arg_buffer.
                $is_second_argument = false;
            }
            if ($is_second_argument) {
                $value_buffer[] = $token;
            } else {
                $third_arg_buffer[] = $token;
            }
        }

        // Capture until the semicolon
        //     define("WP_DEBUG", true)  ;
        //                             ^^^
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === ";") {
                break;
            }
        }

        // Decide whether $name_buffer is a constant name or an expression
        $name_token = null;
        $name_token_index = $token;
        $name_is_literal = true;
        foreach ($name_buffer as $k => $token) {
            if (is_array($token)) {
                if ($token[0] === T_WHITESPACE || $token[0] === T_COMMENT || $token[0] === T_DOC_COMMENT) {
                    continue;
                } else if ($token[0] === T_STRING || $token[0] === T_CONSTANT_ENCAPSED_STRING) {
                    $name_token = $token;
                    $name_token_index = $k;
                } else {
                    $name_is_literal = false;
                    break;
                }
            } else if ($token !== "(" && $token !== ")") {
                $name_is_literal = false;
                break;
            }
        }

        // We can't handle expressions as constant names. Let's wrap that define
        // call in an if(!defined()) statement, just in case it collides with
        // a constant name.
        if (!$name_is_literal) {
            // Ensure the defined expression is not already accounted for
            foreach ($defined_expressions as $defined_expression) {
                if ($defined_expression === stringify_tokens(skip_whitespace($name_buffer))) {
                    $output = array_merge($output, $buffer);
                    continue 2;
                }
            }
            $output = array_merge(
                $output,
                ["if(!defined("],
                $name_buffer,
                [")) {\\n     "],
                ['define('],
                $name_buffer,
                [','],
                $value_buffer,
                $third_arg_buffer,
                [");"],
                ["\\n}\\n"]
            );
            continue;
        }

        // Yay, we have a literal constant name in the buffer now. Let's
        // get its value:
        $name = eval('return ' . $name_token[1] . ';');

        // If the constant name is not in the list of constants we're looking,
        // we can ignore it.
        if (!array_key_exists($name, $constants)) {
            $output = array_merge($output, $buffer);
            continue;
        }

        // We now have a define() call that defines a constant we're looking for.
        // Let's rewrite its value to the one 
        $output = array_merge(
            $output,
            ['define('],
            $name_buffer,
            [','],
            [var_export($constants[$name], true)],
            $third_arg_buffer,
            [");"]
        );

        // Remove the constant from the list so we can process any remaining
        // constants later.
        unset($constants[$name]);
    } while (count($tokens));

    // Add any constants that weren't found in the file
    if (count($constants)) {
        $prepend = [
            "<?php \\n"
        ];
        foreach ($constants as $name => $value) {
            $prepend = array_merge(
                $prepend,
                [
                    "define(",
                    var_export($name, true),
                    ',',
                    var_export($value, true),
                    ");\\n"
                ]
            );
        }
        $prepend[] = "?>";
        $output = array_merge(
            $prepend,
            $output
        );
    }

    // Translate the output tokens back into a string
    return stringify_tokens($output);
}

function stringify_tokens($tokens) {
    $output = '';
    foreach ($tokens as $token) {
        if (is_array($token)) {
            $output .= $token[1];
        } else {
            $output .= $token;
        }
    }
    return $output;
}

function skip_whitespace($tokens) {
    $output = [];
    foreach ($tokens as $token) {
        if (is_array($token) && ($token[0] === T_WHITESPACE || $token[0] === T_COMMENT || $token[0] === T_DOC_COMMENT)) {
            continue;
        }
        $output[] = $token;
    }
    return $output;
}
`,T=async(e,{consts:t,method:n="define-before-run"})=>{switch(n){case"define-before-run":await vt(e,t);break;case"rewrite-wp-config":{const r=await e.documentRoot,s=f(r,"/wp-config.php"),i=await e.readFileAsText(s),o=await Tt(e,i,t);await e.writeFile(s,o);break}default:throw new Error(`Invalid method: ${n}`)}};async function vt(e,t){for(const n in t)await e.defineConstant(n,t[n])}async function Tt(e,t,n){await e.writeFile("/tmp/code.php",t);const r=O({consts:n});return await e.run({code:`${kt}
	$wp_config_path = '/tmp/code.php';
	$wp_config = file_get_contents($wp_config_path);
	$new_wp_config = rewrite_wp_config_to_define_constants($wp_config, ${r.consts});
	file_put_contents($wp_config_path, $new_wp_config);
	`}),await e.readFileAsText("/tmp/code.php")}const z=async(e,{username:t="admin",password:n="password"}={},r)=>{r?.tracker.setCaption(r?.initialCaption||"Logging in"),await e.request({url:"/wp-login.php"});const s=await e.request({url:"/wp-login.php",method:"POST",body:{log:t,pwd:n,rememberme:"forever"}});if(!s.headers?.location?.[0]?.includes("/wp-admin/"))throw E.warn("WordPress response was",{response:s,text:s.text}),new Error(`Failed to log in as ${t} with password ${n}`)},$e=async(e,{options:t})=>{const n=await e.documentRoot;await e.run({code:`<?php
		include ${h(n)} . '/wp-load.php';
		$site_options = ${h(t)};
		foreach($site_options as $name => $value) {
			update_option($name, $value);
		}
		echo "Success";
		`})},Pt=async(e,{meta:t,userId:n})=>{const r=await e.documentRoot;await e.run({code:`<?php
		include ${h(r)} . '/wp-load.php';
		$meta = ${h(t)};
		foreach($meta as $name => $value) {
			update_user_meta(${h(n)}, $name, $value);
		}
		`})},St=async e=>{await T(e,{consts:{WP_ALLOW_MULTISITE:1}});const t=new URL(await e.absoluteUrl);if(t.port!==""){let p=`The current host is ${t.host}, but WordPress multisites do not support custom ports.`;throw t.hostname==="localhost"&&(p+=" For development, you can set up a playground.test domain using the instructions at https://wordpress.github.io/wordpress-playground/contributing/code."),new Error(p)}const n=t.pathname.replace(/\/$/,"")+"/",r=`${t.protocol}//${t.hostname}${n}`;await $e(e,{options:{siteurl:r,home:r}}),await z(e,{});const s=await e.documentRoot,o=(await e.run({code:`<?php
define( 'WP_ADMIN', true );
require_once(${h(s)} . "/wp-load.php");

// Set current user to admin
( get_users(array('role' => 'Administrator') )[0] );

require_once(${h(s)} . "/wp-admin/includes/plugin.php");
$plugins_root = ${h(s)} . "/wp-content/plugins";
$plugins = glob($plugins_root . "/*");

$deactivated_plugins = [];
foreach($plugins as $plugin_path) {
	if (str_ends_with($plugin_path, '/index.php')) {
		continue;
	}
	if (!is_dir($plugin_path)) {
		$deactivated_plugins[] = substr($plugin_path, strlen($plugins_root) + 1);
		deactivate_plugins($plugin_path);
		continue;
	}
	// Find plugin entry file
	foreach ( ( glob( $plugin_path . '/*.php' ) ?: array() ) as $file ) {
		$info = get_plugin_data( $file, false, false );
		if ( ! empty( $info['Name'] ) ) {
			deactivate_plugins( $file );
			$deactivated_plugins[] = substr($file, strlen($plugins_root) + 1);
			break;
		}
	}
}
echo json_encode($deactivated_plugins);
`})).json,l=(await B(e,{request:{url:"/wp-admin/network.php"}})).text.match(/name="_wpnonce"\s+value="([^"]+)"/)?.[1],a=await B(e,{request:{url:"/wp-admin/network.php",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:xt({_wpnonce:l,_wp_http_referer:n+"wp-admin/network.php",sitename:"My WordPress Website Sites",email:"admin@localhost.com",submit:"Install"})}});if(a.httpStatusCode!==200)throw E.warn("WordPress response was",{response:a,text:a.text,headers:a.headers}),new Error(`Failed to enable multisite. Response code was ${a.httpStatusCode}`);await T(e,{consts:{MULTISITE:!0,SUBDOMAIN_INSTALL:!1,SITE_ID_CURRENT_SITE:1,BLOG_ID_CURRENT_SITE:1,DOMAIN_CURRENT_SITE:t.hostname,PATH_CURRENT_SITE:n}});const u=new URL(await e.absoluteUrl),d=pe(u)?"scope:"+tt(u):null;await e.writeFile("/internal/shared/preload/sunrise.php",`<?php
	$_SERVER['HTTP_HOST'] = ${h(u.hostname)};
	$folder = ${h(d)};
	if ($folder && strpos($_SERVER['REQUEST_URI'],"/$folder") === false) {
		$_SERVER['REQUEST_URI'] = "/$folder/" . ltrim($_SERVER['REQUEST_URI'], '/');
	}
`),await e.writeFile("/internal/shared/mu-plugins/sunrise.php",`<?php
		if ( !defined( 'BLOG_ID_CURRENT_SITE' ) ) {
			define( 'BLOG_ID_CURRENT_SITE', 1 );
		}
`),await z(e,{});for(const p of o)await H(e,{pluginPath:p})};function xt(e){return Object.keys(e).map(t=>encodeURIComponent(t)+"="+encodeURIComponent(e[t])).join("&")}const Rt=async(e,{fromPath:t,toPath:n})=>{await e.writeFile(n,await e.readFileAsBuffer(t))},Ct=async(e,{fromPath:t,toPath:n})=>{await e.mv(t,n)},Lt=async(e,{path:t})=>{await e.mkdir(t)},It=async(e,{path:t})=>{await e.rmdir(t)},_e=async(e,{path:t,data:n})=>{n instanceof File&&(n=new Uint8Array(await n.arrayBuffer())),t.startsWith("/wordpress/wp-content/mu-plugins")&&!await e.fileExists("/wordpress/wp-content/mu-plugins")&&await e.mkdir("/wordpress/wp-content/mu-plugins"),await e.writeFile(t,n)},ge=async(e,{siteUrl:t})=>{await T(e,{consts:{WP_HOME:t,WP_SITEURL:t}})},Ot=async(e,{file:t},n)=>{n?.tracker?.setCaption("Importing content"),await _e(e,{path:"/tmp/import.wxr",data:t});const r=await e.documentRoot;await e.run({code:`<?php
		require ${h(r)} . '/wp-load.php';
		require ${h(r)} . '/wp-admin/includes/admin.php';
  
		kses_remove_filters();
		$admin_id = get_users(array('role' => 'Administrator') )[0]->ID;
        wp_set_current_user( $admin_id );
		$importer = new WXR_Importer( array(
			'fetch_attachments' => true,
			'default_author' => $admin_id
		) );
		$logger = new WP_Importer_Logger_CLI();
		$importer->set_logger( $logger );

		// Slashes from the imported content are lost if we don't call wp_slash here.
		add_action( 'wp_insert_post_data', function( $data ) {
			return wp_slash($data);
		});

		$result = $importer->import( '/tmp/import.wxr' );
		`})},ye=async(e,{themeSlug:t=""},n)=>{n?.tracker?.setCaption("Importing theme starter content");const r=await e.documentRoot;await e.run({code:`<?php

		/**
		 * Ensure that the customizer loads as an admin user.
		 *
		 * For compatibility with themes, this MUST be run prior to theme inclusion, which is why this is a plugins_loaded filter instead
		 * of running _wp_customize_include() manually after load.
		 */
		function importThemeStarterContent_plugins_loaded() {
			// Set as the admin user, this ensures we can customize the site.
			wp_set_current_user(
				get_users( [ 'role' => 'Administrator' ] )[0]
			);

			// Force the site to be fresh, although it should already be.
			add_filter( 'pre_option_fresh_site', '__return_true' );

			/*
			 * Simulate this request as the customizer loading with the current theme in preview mode.
			 *
			 * See _wp_customize_include()
			 */
			$_REQUEST['wp_customize']    = 'on';
			$_REQUEST['customize_theme'] = ${h(t)} ?: get_stylesheet();

			/*
			 * Claim this is a ajax request saving settings, to avoid the preview filters being applied.
			 */
			$_REQUEST['action'] = 'customize_save';
			add_filter( 'wp_doing_ajax', '__return_true' );

			$_GET = $_REQUEST;
		}
		playground_add_filter( 'plugins_loaded', 'importThemeStarterContent_plugins_loaded', 0 );

		require ${h(r)} . '/wp-load.php';

		// Return early if there's no starter content.
		if ( ! get_theme_starter_content() ) {
			return;
		}

		// Import the Starter Content.
		$wp_customize->import_theme_starter_content();

		// Publish the changeset, which publishes the starter content.
		wp_publish_post( $wp_customize->changeset_post_id() );
		`})},W="/tmp/file.zip",Ee=async(e,t,n,r=!0)=>{if(t instanceof File){const i=t;t=W,await e.writeFile(t,new Uint8Array(await i.arrayBuffer()))}const s=O({zipPath:t,extractToPath:n,overwriteFiles:r});await e.run({code:`<?php
        function unzip($zipPath, $extractTo, $overwriteFiles = true)
        {
            if (!is_dir($extractTo)) {
                mkdir($extractTo, 0777, true);
            }
            $zip = new ZipArchive;
            $res = $zip->open($zipPath);
            if ($res === TRUE) {
				for ($i = 0; $i < $zip->numFiles; $i++) {
					$filename = $zip->getNameIndex($i);
					$fileinfo = pathinfo($filename);
					$extractFilePath = rtrim($extractTo, '/') . '/' . $filename;
					// Check if file exists and $overwriteFiles is false
					if (!file_exists($extractFilePath) || $overwriteFiles) {
						// Extract file
						$zip->extractTo($extractTo, $filename);
					}
				}
				$zip->close();
				chmod($extractTo, 0777);
            } else {
                throw new Exception("Could not unzip file");
            }
        }
        unzip(${s.zipPath}, ${s.extractToPath}, ${s.overwriteFiles});
        `}),await e.fileExists(W)&&await e.unlink(W)},j=async(e,{zipFile:t,zipPath:n,extractToPath:r})=>{if(n)E.warn('The "zipPath" option of the unzip() Blueprint step is deprecated and will be removed. Use "zipFile" instead.');else if(!t)throw new Error("Either zipPath or zipFile must be provided");await Ee(e,t||n,r)},At=async(e,{wordPressFilesZip:t,pathInZip:n=""})=>{const r=await e.documentRoot;let s=f("/tmp","import");await e.mkdir(s),await j(e,{zipFile:t,extractToPath:s}),s=f(s,n);const i=f(s,"wp-content"),o=f(r,"wp-content");for(const u of he){const d=f(i,u);await K(e,d);const p=f(o,u);await e.fileExists(p)&&(await e.mkdir(te(d)),await e.mv(p,d))}const c=f(s,"wp-content","database");await e.fileExists(c)||await e.mv(f(r,"wp-content","database"),c);const l=await e.listFiles(s);for(const u of l)await K(e,f(r,u)),await e.mv(f(s,u),f(r,u));await e.rmdir(s),await ge(e,{siteUrl:await e.absoluteUrl});const a=h(f(r,"wp-admin","upgrade.php"));await e.run({code:`<?php
            $_GET['step'] = 'upgrade_db';
            require ${a};
            `})};async function K(e,t){await e.fileExists(t)&&(await e.isDir(t)?await e.rmdir(t):await e.unlink(t))}async function Ft(e){const t=await e.request({url:"/wp-admin/export.php?download=true&content=all"});return new File([t.bytes],"export.xml")}async function be(e,{targetPath:t,zipFile:n,ifAlreadyInstalled:r="overwrite"}){const i=n.name.replace(/\.zip$/,""),o=f(await e.documentRoot,"wp-content"),c=f(o,re()),l=f(c,"assets",i);await e.fileExists(l)&&await e.rmdir(c,{recursive:!0}),await e.mkdir(c);try{await j(e,{zipFile:n,extractToPath:l});let a=await e.listFiles(l,{prependPath:!0});a=a.filter(Te=>!Te.endsWith("/__MACOSX"));const u=a.length===1&&await e.isDir(a[0]);let d,p="";u?(p=a[0],d=a[0].split("/").pop()):(p=l,d=i);const m=`${t}/${d}`;if(await e.fileExists(m)){if(!await e.isDir(m))throw new Error(`Cannot install asset ${d} to ${m} because a file with the same name already exists. Note it's a file, not a directory! Is this by mistake?`);if(r==="overwrite")await e.rmdir(m,{recursive:!0});else{if(r==="skip")return{assetFolderPath:m,assetFolderName:d};throw new Error(`Cannot install asset ${d} to ${t} because it already exists and the ifAlreadyInstalled option was set to ${r}`)}}return await e.mv(p,m),{assetFolderPath:m,assetFolderName:d}}finally{await e.rmdir(c,{recursive:!0})}}function ke(e){const t=e.split(".").shift().replace(/-/g," ");return t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}const Wt=async(e,{pluginZipFile:t,ifAlreadyInstalled:n,options:r={}},s)=>{const i=t.name.split("/").pop()||"plugin.zip",o=ke(i);s?.tracker.setCaption(`Installing the ${o} plugin`);const{assetFolderPath:c}=await be(e,{ifAlreadyInstalled:n,zipFile:t,targetPath:`${await e.documentRoot}/wp-content/plugins`});("activate"in r?r.activate:!0)&&await H(e,{pluginPath:c,pluginName:o},s)},Nt=async(e,{themeZipFile:t,ifAlreadyInstalled:n,options:r={}},s)=>{const i=ke(t.name);s?.tracker.setCaption(`Installing the ${i} theme`);const{assetFolderName:o}=await be(e,{ifAlreadyInstalled:n,zipFile:t,targetPath:`${await e.documentRoot}/wp-content/themes`});("activate"in r?r.activate:!0)&&await me(e,{themeFolderName:o},s),("importStarterContent"in r?r.importStarterContent:!1)&&await ye(e,{themeSlug:o},s)},Dt=async(e,t,n)=>{n?.tracker?.setCaption("Resetting WordPress data");const r=await e.documentRoot;await e.run({env:{DOCROOT:r},code:`<?php
		require getenv('DOCROOT') . '/wp-load.php';

		$GLOBALS['@pdo']->query('DELETE FROM wp_posts WHERE id > 0');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='wp_posts'");
		
		$GLOBALS['@pdo']->query('DELETE FROM wp_postmeta WHERE post_id > 1');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=20 WHERE NAME='wp_postmeta'");

		$GLOBALS['@pdo']->query('DELETE FROM wp_comments');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='wp_comments'");

		$GLOBALS['@pdo']->query('DELETE FROM wp_commentmeta');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='wp_commentmeta'");
		`})},Mt=async(e,{options:t})=>{await e.request({url:"/wp-admin/install.php?step=2",method:"POST",body:{language:"en",prefix:"wp_",weblog_title:"My WordPress Website",user_name:t.adminPassword||"admin",admin_password:t.adminPassword||"password",admin_password2:t.adminPassword||"password",Submit:"Install WordPress",pw_weak:"1",admin_email:"admin@localhost.com"}})},Ut=async(e,{selfContained:t=!1}={})=>{const n="/tmp/wordpress-playground.zip",r=await e.documentRoot,s=f(r,"wp-content");let i=he;t&&(i=i.filter(l=>!l.startsWith("themes/twenty")).filter(l=>l!=="mu-plugins/sqlite-database-integration"));const o=O({zipPath:n,wpContentPath:s,documentRoot:r,exceptPaths:i.map(l=>f(r,"wp-content",l)),additionalPaths:t?{[f(r,"wp-config.php")]:"wp-config.php"}:{}});await zt(e,`zipDir(${o.wpContentPath}, ${o.zipPath}, array(
			'exclude_paths' => ${o.exceptPaths},
			'zip_root'      => ${o.documentRoot},
			'additional_paths' => ${o.additionalPaths}
		));`);const c=await e.readFileAsBuffer(n);return e.unlink(n),c},Bt=`<?php

function zipDir($root, $output, $options = array())
{
    $root = rtrim($root, '/');
    $additionalPaths = array_key_exists('additional_paths', $options) ? $options['additional_paths'] : array();
    $excludePaths = array_key_exists('exclude_paths', $options) ? $options['exclude_paths'] : array();
    $zip_root = array_key_exists('zip_root', $options) ? $options['zip_root'] : $root;

    $zip = new ZipArchive;
    $res = $zip->open($output, ZipArchive::CREATE);
    if ($res === TRUE) {
        $directories = array(
            $root . '/'
        );
        while (sizeof($directories)) {
            $current_dir = array_pop($directories);

            if ($handle = opendir($current_dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry == '.' || $entry == '..') {
                        continue;
                    }

                    $entry = join_paths($current_dir, $entry);
                    if (in_array($entry, $excludePaths)) {
                        continue;
                    }

                    if (is_dir($entry)) {
                        $directory_path = $entry . '/';
                        array_push($directories, $directory_path);
                    } else if (is_file($entry)) {
                        $zip->addFile($entry, substr($entry, strlen($zip_root)));
                    }
                }
                closedir($handle);
            }
        }
        foreach ($additionalPaths as $disk_path => $zip_path) {
            $zip->addFile($disk_path, $zip_path);
        }
        $zip->close();
        chmod($output, 0777);
    }
}

function join_paths()
{
    $paths = array();

    foreach (func_get_args() as $arg) {
        if ($arg !== '') {
            $paths[] = $arg;
        }
    }

    return preg_replace('#/+#', '/', join('/', $paths));
}
`;async function zt(e,t){return await e.run({code:Bt+t})}const qt=async(e,{command:t,wpCliPath:n="/tmp/wp-cli.phar"})=>{if(!await e.fileExists(n))throw new Error(`wp-cli.phar not found at ${n}.
			You can enable wp-cli support by adding "wp-cli" to the list of extra libraries in your blueprint as follows:
			{
				"extraLibraries": [ "wp-cli" ]
			}

			Read more about it in the documentation.
			https://wordpress.github.io/wordpress-playground/blueprints/data-format#extra-libraries`);let r;if(typeof t=="string"?(t=t.trim(),r=Gt(t)):r=t,r.shift()!=="wp")throw new Error('The first argument must be "wp".');await e.writeFile("/tmp/stdout",""),await e.writeFile("/tmp/stderr",""),await e.writeFile("/wordpress/run-cli.php",`<?php
		// Set up the environment to emulate a shell script
		// call.

		// Set SHELL_PIPE to 0 to ensure WP-CLI formats
		// the output as ASCII tables.
		// @see https://github.com/wp-cli/wp-cli/issues/1102
		putenv( 'SHELL_PIPE=0' );

		// Set the argv global.
		$GLOBALS['argv'] = array_merge([
		  "/tmp/wp-cli.phar",
		  "--path=/wordpress"
		], ${h(r)});

		// Provide stdin, stdout, stderr streams outside of
		// the CLI SAPI.
		define('STDIN', fopen('php://stdin', 'rb'));
		define('STDOUT', fopen('php://stdout', 'wb'));
		define('STDERR', fopen('php://stderr', 'wb'));

		require( ${h(n)} );
		`);const i=await e.run({scriptPath:"/wordpress/run-cli.php"});if(i.errors)throw new Error(i.errors);return i};function Gt(e){let r=0,s="";const i=[];let o="";for(let c=0;c<e.length;c++){const l=e[c];r===0?l==='"'||l==="'"?(r=1,s=l):l.match(/\s/)?(o&&i.push(o),o=""):o+=l:r===1&&(l==="\\"?(c++,o+=e[c]):l===s?(r=0,s=""):o+=l)}return o&&i.push(o),i}const Ht=async(e,{language:t},n)=>{n?.tracker.setCaption(n?.initialCaption||"Translating"),await e.defineConstant("WPLANG",t);const r=await e.documentRoot,i=[{url:`https://downloads.wordpress.org/translation/core/${(await e.run({code:`<?php
			require '${r}/wp-includes/version.php';
			echo $wp_version;
		`})).text}/${t}.zip`,type:"core"}],c=(await e.run({code:`<?php
		require_once('${r}/wp-load.php');
		require_once('${r}/wp-admin/includes/plugin.php');
		echo json_encode(
			array_values(
				array_map(
					function($plugin) {
						return [
							'slug'    => $plugin['TextDomain'],
							'version' => $plugin['Version']
						];
					},
					array_filter(
						get_plugins(),
						function($plugin) {
							return !empty($plugin['TextDomain']);
						}
					)
				)
			)
		);`})).json;for(const{slug:u,version:d}of c)i.push({url:`https://downloads.wordpress.org/translation/plugin/${u}/${d}/${t}.zip`,type:"plugin"});const a=(await e.run({code:`<?php
		require_once('${r}/wp-load.php');
		require_once('${r}/wp-admin/includes/theme.php');
		echo json_encode(
			array_values(
				array_map(
					function($theme) {
						return [
							'slug'    => $theme->get('TextDomain'),
							'version' => $theme->get('Version')
						];
					},
					wp_get_themes()
				)
			)
		);`})).json;for(const{slug:u,version:d}of a)i.push({url:`https://downloads.wordpress.org/translation/theme/${u}/${d}/${t}.zip`,type:"theme"});await e.isDir(`${r}/wp-content/languages/plugins`)||await e.mkdir(`${r}/wp-content/languages/plugins`),await e.isDir(`${r}/wp-content/languages/themes`)||await e.mkdir(`${r}/wp-content/languages/themes`);for(const{url:u,type:d}of i)try{const p=await fetch(u);if(!p.ok)throw new Error(`Failed to download translations for ${d}: ${p.statusText}`);let m=`${r}/wp-content/languages`;d==="plugin"?m+="/plugins":d==="theme"&&(m+="/themes"),await Ee(e,new File([await p.blob()],`${t}-${d}.zip`),m)}catch(p){if(d==="core")throw new Error(`Failed to download translations for WordPress. Please check if the language code ${t} is correct. You can find all available languages and translations on https://translate.wordpress.org/.`);E.warn(`Error downloading translations for ${d}: ${p}`)}},jt=Object.freeze(Object.defineProperty({__proto__:null,activatePlugin:H,activateTheme:me,cp:Rt,defineSiteUrl:ge,defineWpConfigConsts:T,enableMultisite:St,exportWXR:Ft,importThemeStarterContent:ye,importWordPressFiles:At,importWxr:Ot,installPlugin:Wt,installTheme:Nt,login:z,mkdir:Lt,mv:Ct,request:B,resetData:Dt,rm:we,rmdir:It,runPHP:yt,runPHPWithOptions:Et,runSql:bt,runWpInstallationWizard:Mt,setSiteLanguage:Ht,setSiteOptions:$e,unzip:j,updateUserMeta:Pt,wpCLI:qt,writeFile:_e,zipWpContent:Ut},Symbol.toStringTag,{value:"Module"})),{wpCLI:Qt,...Z}=jt;({...Z,importFile:Z.importWxr});async function Vt(e){await T(e,{consts:{USE_FETCH_FOR_REQUESTS:!0}}),await e.onMessage(async t=>{let n;try{n=JSON.parse(t)}catch{return""}const{type:r,data:s}=n;return r!=="request"?"":(s.headers?Array.isArray(s.headers)&&(s.headers=Object.fromEntries(s.headers)):s.headers={},new URL(s.url).hostname===window.location.hostname&&(s.headers["x-request-issuer"]="php"),Jt(s))})}async function Jt(e,t=fetch){const n=new URL(e.url).hostname,r=["w.org","s.w.org"].includes(n)?`/plugin-proxy.php?url=${encodeURIComponent(e.url)}`:e.url;let s;try{const u=e.method||"GET",d=e.headers||{};u=="POST"&&(d["Content-Type"]="application/x-www-form-urlencoded"),s=await t(r,{method:u,headers:d,body:e.data,credentials:"omit"})}catch{return new TextEncoder().encode(`HTTP/1.1 400 Invalid Request\r
content-type: text/plain\r
\r
Playground could not serve the request.`)}const i=[];s.headers.forEach((u,d)=>{i.push(d+": "+u)});const o=["HTTP/1.1 "+s.status+" "+s.statusText,...i].join(`\r
`)+`\r
\r
`,c=new TextEncoder().encode(o),l=new Uint8Array(await s.arrayBuffer()),a=new Uint8Array(c.byteLength+l.byteLength);return a.set(c),a.set(l,c.byteLength),a}const ve=new URL("/",(import.meta||{}).url).origin,Yt=new URL(_t,ve)+"",Kt=new URL(gt,ve),Zt=new URL(document.location.href).searchParams;async function Xt(){tn();const e=Zt.has("progressbar");let t;e&&(t=new $t,document.body.prepend(t.element));const n=Math.random().toFixed(16);await st(n,Kt+"");const r=Ke(await ot(Yt));rt(r);const s=document.querySelector("#wp"),i={async onDownloadProgress(a){return r.onDownloadProgress(a)},async journalFSEvents(a,u){return r.journalFSEvents(a,u)},async replayFSJournal(a){return r.replayFSJournal(a)},async addEventListener(a,u){return await r.addEventListener(a,u)},async removeEventListener(a,u){return await r.removeEventListener(a,u)},async setProgress(a){if(!t)throw new Error("Progress bar not available");t.setOptions(a)},async setLoaded(){if(!t)throw new Error("Progress bar not available");t.destroy()},async onNavigation(a){s.addEventListener("load",async u=>{try{const d=await l.internalUrlToPath(u.currentTarget.contentWindow.location.href);a(d)}catch{}})},async goTo(a){a.startsWith("/")||(a="/"+a);const u=await l.pathToInternalUrl(a),d=s.src;if(u===d&&s.contentWindow)try{s.contentWindow.location.href=u;return}catch{}s.src=u},async getCurrentURL(){let a="";try{a=s.contentWindow.location.href}catch{}return a||(a=s.src),await l.internalUrlToPath(a)},async setIframeSandboxFlags(a){s.setAttribute("sandbox",a.join(" "))},async onMessage(a){return await r.onMessage(a)},async mountOpfs(a,u){return await r.mountOpfs(a,u)},async unmountOpfs(a){return await r.unmountOpfs(a)},async backfillStaticFilesRemovedFromMinifiedBuild(){await r.backfillStaticFilesRemovedFromMinifiedBuild()},async hasCachedStaticFilesRemovedFromMinifiedBuild(){return await r.hasCachedStaticFilesRemovedFromMinifiedBuild()},async boot(a){await r.boot({...a,scope:n});try{await r.isReady(),it(s,en(await l.absoluteUrl)),a.withNetworking&&await Vt(r),o()}catch(u){throw c(u),u}await i.hasCachedStaticFilesRemovedFromMinifiedBuild()?await i.backfillStaticFilesRemovedFromMinifiedBuild():s.addEventListener("load",()=>{i.backfillStaticFilesRemovedFromMinifiedBuild()})}};await r.isConnected();const[o,c,l]=Xe(i,r);return l}function en(e){return new URL(e,"https://example.com").origin}function tn(){let e=!1;try{e=window.parent!==window&&window.parent.IS_WASM_WORDPRESS}catch{}if(e)throw new Error(`The service worker did not load correctly. This is a bug,
			please report it on https://github.com/WordPress/wordpress-playground/issues`);window.IS_WASM_WORDPRESS=!0}const nn="nightly",rn="6.6.1-RC1",sn={nightly:nn,beta:rn,"6.6":"6.6.1","6.5":"6.5.5","6.4":"6.4.5","6.3":"6.3.5"},on=Object.keys(sn);on.filter(e=>e.match(/^\d/))[0];window.top!=window.self&&document.body.classList.add("is-embedded");try{window.playground=await Xt()}catch(e){console.error(e),document.body.className="has-error",document.body.innerHTML="",e?.name==="NotSupportedError"?document.body.append(await cn()):document.body.append(an(e))}finally{document.body.classList.remove("is-loading")}function an(e){const t=document.createDocumentFragment(),n=document.createElement("div");n.className="error-message";const r=e.userFriendlyMessage||"See the developer tools for error details.";n.innerHTML="Ooops! WordPress Playground had a hiccup! <br/><br/> "+r,t.append(n);const s=document.createElement("button");s.innerText="Try again",s.onclick=()=>{window.location.reload()},t.append(s);const i=document.createElement("p");return i.innerHTML=`
					If the problem persists, please
					<a href="https://github.com/WordPress/playground-tools/issues/new"
						target="_blank"
						>report an issue on GitHub</a>.
				`,t.append(i),t}async function cn(){const e=document.createDocumentFragment();let t=!1;try{const{state:n}=await navigator.permissions.query({name:"storage-access"});t=n==="granted"}catch{}if(t||!("requestStorageAccess"in document)){const n=document.createElement("div");n.innerText="It looks like you have disabled third-party cookies in your browser. This also disables the Service Worker API used by WordPress Playground. Please re-enable third-party cookies and try again.",e.append(n);const r=document.createElement("button");r.innerText="Try again",r.onclick=()=>{window.location.reload()},e.append(r)}else{const n=document.createElement("div");n.innerText="WordPress Playground needs to use storage in your browser.",e.append(n);const r=document.createElement("button");r.innerText="Allow storage access",e.append(r),r.onclick=async()=>{try{await document.requestStorageAccess(),window.location.reload()}catch{n.innerHTML=`
								<p>
									Oops! Playground failed to start. Here's what to do:
								</p>

								<h3>Did you disable third-party cookies?</h3>
								<p>
									It also disables the required Service Worker API. Please re-enable
									third-party cookies and try again.
								</p>

								<h3>Did you refuse to grant Playground storage access?</h3>
								<p>
									Click the button below and grant storage access. Note the button may
									not work if you have disabled third-party cookies in your browser.
								</p>
								<p>
									If neither method helped, please
									<a href="https://github.com/WordPress/playground-tools/issues/new"
										target="_blank">
										report an issue on GitHub
									</a>.
								</p>
								`}}}return e}
