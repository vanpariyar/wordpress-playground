"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});require("@php-wasm/node-polyfills");const m="playground-log",d=(e,...r)=>{y.dispatchEvent(new CustomEvent(m,{detail:{log:e,args:r}}))},b=(e,...r)=>{switch(typeof e.message=="string"?Reflect.set(e,"message",a(e.message)):e.message.message&&typeof e.message.message=="string"&&Reflect.set(e.message,"message",a(e.message.message)),e.severity){case"Debug":console.debug(e.message,...r);break;case"Info":console.info(e.message,...r);break;case"Warn":console.warn(e.message,...r);break;case"Error":console.error(e.message,...r);break;case"Fatal":console.error(e.message,...r);break;default:console.log(e.message,...r)}},v=e=>e instanceof Error?[e.message,e.stack].join(`
`):JSON.stringify(e,null,2),p=[],l=e=>{p.push(e)},c=e=>{if(e.raw===!0)l(e.message);else{const r=E(typeof e.message=="object"?v(e.message):e.message,e.severity??"Info",e.prefix??"JavaScript");l(r)}};let n=0;const g="/wordpress/wp-content/debug.log",T=async e=>await e.fileExists(g)?await e.readFileAsText(g):"",M=(e,r)=>{r.addEventListener("request.end",async()=>{const s=await T(r);if(s.length>n){const t=s.substring(n);e.logMessage({message:t,raw:!0}),n=s.length}}),r.addEventListener("request.error",s=>{s=s,s.error&&(e.logMessage({message:`${s.error.message} ${s.error.stack}`,severity:"Fatal",prefix:s.source==="request"?"PHP":"WASM Crash"}),e.dispatchEvent(new CustomEvent(e.fatalErrorEvent,{detail:{logs:e.getLogs(),source:s.source}})))})};class h extends EventTarget{constructor(r=[]){super(),this.handlers=r,this.fatalErrorEvent="playground-fatal-error"}getLogs(){return this.handlers.includes(c)?[...p]:(this.error(`Logs aren't stored because the logToMemory handler isn't registered.
				If you're using a custom logger instance, make sure to register logToMemory handler.
			`),[])}logMessage(r,...s){for(const t of this.handlers)t(r,...s)}log(r,...s){this.logMessage({message:r,severity:void 0,prefix:"JavaScript",raw:!1},...s)}debug(r,...s){this.logMessage({message:r,severity:"Debug",prefix:"JavaScript",raw:!1},...s)}info(r,...s){this.logMessage({message:r,severity:"Info",prefix:"JavaScript",raw:!1},...s)}warn(r,...s){this.logMessage({message:r,severity:"Warn",prefix:"JavaScript",raw:!1},...s)}error(r,...s){this.logMessage({message:r,severity:"Error",prefix:"JavaScript",raw:!1},...s)}}const P=()=>{try{if(process.env.NODE_ENV==="test")return[c,d]}catch{}return[c,b,d]},y=new h(P()),a=e=>e.replace(/\t/g,""),E=(e,r,s)=>{const t=new Date,o=new Intl.DateTimeFormat("en-GB",{year:"numeric",month:"short",day:"2-digit",timeZone:"UTC"}).format(t).replace(/ /g,"-"),w=new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1,timeZone:"UTC",timeZoneName:"short"}).format(t),L=o+" "+w;return e=a(e),`[${L}] ${s} ${r}: ${e}`},O=(e,r)=>{e.addEventListener(e.fatalErrorEvent,r)},S=(e,r)=>{e.logMessage({message:`${r.message} in ${r.filename} on line ${r.lineno}:${r.colno}`,severity:"Error"})},f=(e,r)=>{if(!(r!=null&&r.reason))return;const s=(r==null?void 0:r.reason.stack)??r.reason;e.logMessage({message:s,severity:"Error"})};let i=0;const k=e=>{navigator.serviceWorker.addEventListener("message",r=>{var s,t,o;((s=r.data)==null?void 0:s.numberOfOpenPlaygroundTabs)!==void 0&&i!==((t=r.data)==null?void 0:t.numberOfOpenPlaygroundTabs)&&(i=(o=r.data)==null?void 0:o.numberOfOpenPlaygroundTabs,e.debug(`Number of open Playground tabs is: ${i}`))})};let u=!1;const $=e=>{u||(k(e),!(typeof window>"u")&&(window.addEventListener("error",r=>S(e,r)),window.addEventListener("unhandledrejection",r=>f(e,r)),window.addEventListener("rejectionhandled",r=>f(e,r)),u=!0))},x=e=>{e.addEventListener("activate",()=>{e.clients.matchAll().then(r=>{const s={numberOfOpenPlaygroundTabs:r.filter(t=>t.frameType==="top-level").length};for(const t of r)t.postMessage(s)})})};exports.Logger=h;exports.addCrashListener=O;exports.collectPhpLogs=M;exports.collectWindowErrors=$;exports.errorLogPath=g;exports.formatLogEntry=E;exports.logEventType=m;exports.logger=y;exports.prepareLogMessage=a;exports.reportServiceWorkerMetrics=x;
