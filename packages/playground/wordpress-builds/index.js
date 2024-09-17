const _="/assets/wp-nightly-8a84bf46.zip",w="/assets/wp-beta-ae0b0362.zip",b="/assets/wp-6.6-917ecf17.zip",g="/assets/wp-6.5-264f1631.zip",y="/assets/wp-6.4-f4f06f3b.zip",z="/assets/wp-6.3-cad7e42e.zip";function m(e="6.6"){switch(e){case"nightly":return{size:18402318,url:_};case"beta":return{size:18381300,url:w};case"6.6":return{size:18381398,url:b};case"6.5":return{size:4887384,url:g};case"6.4":return{size:4774235,url:y};case"6.3":return{size:3595053,url:z}}throw new Error("Unsupported WordPress module: "+e)}const P="modulepreload",v=function(e){return"/"+e},d={},f=function(t,r,n){if(!r||r.length===0)return t();const l=document.getElementsByTagName("link");return Promise.all(r.map(s=>{if(s=v(s),s in d)return;d[s]=!0;const i=s.endsWith(".css"),h=i?'[rel="stylesheet"]':"";if(!!n)for(let o=l.length-1;o>=0;o--){const c=l[o];if(c.href===s&&(!i||c.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${s}"]${h}`))return;const a=document.createElement("link");if(a.rel=i?"stylesheet":P,i||(a.as="script",a.crossOrigin=""),a.href=s,document.head.appendChild(a),i)return new Promise((o,c)=>{a.addEventListener("load",o),a.addEventListener("error",()=>c(new Error(`Unable to preload CSS for ${s}`)))})})).then(()=>t()).catch(s=>{const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=s,window.dispatchEvent(i),!i.defaultPrevented)throw s})};async function L(e){const t=m(e).url;let r=null;if(t.startsWith("/")){let n=t;n.startsWith("/@fs/")&&(n=n.slice(4));const{readFile:l}=await f(()=>import("./assets/__vite-browser-external-b25bb000.js"),[]);r=await l(n)}else r=await(await fetch(t)).blob();return new File([r],`${e||"wp"}.zip`,{type:"application/zip"})}const u="/assets/sqlite-database-integration-7d5a8261.zip",E=86873,M=Object.freeze(Object.defineProperty({__proto__:null,size:E,url:u},Symbol.toStringTag,{value:"Module"}));async function R(){let e=null;if(u.startsWith("/")){let t=u;t.startsWith("/@fs/")&&(t=t.slice(4));const{readFile:r}=await f(()=>import("./assets/__vite-browser-external-b25bb000.js"),[]);e=await r(t)}else e=await(await fetch(u)).blob();return new File([e],"sqlite.zip",{type:"application/zip"})}const W="nightly",D="6.6.1-RC1",p={nightly:W,beta:D,"6.6":"6.6.1","6.5":"6.5.5","6.4":"6.4.5","6.3":"6.3.5"},S=Object.keys(p),q=S.filter(e=>e.match(/^\d/))[0];function O(e){return e in p?`wp-${e}`:void 0}export{q as LatestMinifiedWordPressVersion,p as MinifiedWordPressVersions,S as MinifiedWordPressVersionsList,R as getSqliteDatabaseModule,L as getWordPressModule,m as getWordPressModuleDetails,M as sqliteDatabaseIntegrationModuleDetails,O as wpVersionToStaticAssetsDirectory};
