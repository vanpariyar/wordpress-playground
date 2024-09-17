"use strict";(self.webpackChunkdocusaurus_classic_typescript=self.webpackChunkdocusaurus_classic_typescript||[]).push([[3747],{405:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>i,contentTitle:()=>o,default:()=>u,frontMatter:()=>n,metadata:()=>p,toc:()=>l});var a=r(11),s=(r(2735),r(9530));const n={},o="WebAssembly PHP",p={unversionedId:"architecture/wasm-php-overview",id:"architecture/wasm-php-overview",title:"WebAssembly PHP",description:"WordPress Playground build the PHP interpreter to WebAssembly using Emscripten and a dedicated pipeline.",source:"@site/docs/11-architecture/02-wasm-php-overview.md",sourceDirName:"11-architecture",slug:"/architecture/wasm-php-overview",permalink:"/wordpress-playground/docs/architecture/wasm-php-overview",draft:!1,editUrl:"https://github.com/WordPress/wordpress-playground/tree/trunk/packages/docs/site/docs/11-architecture/02-wasm-php-overview.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Architecture Overview",permalink:"/wordpress-playground/docs/architecture/index"},next:{title:"Compiling PHP",permalink:"/wordpress-playground/docs/architecture/wasm-php-compiling"}},i={},l=[{value:"Networking support varies between platforms",id:"networking-support-varies-between-platforms",level:3}],c={toc:l},d="wrapper";function u(e){let{components:t,...n}=e;return(0,s.kt)(d,(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"webassembly-php"},"WebAssembly PHP"),(0,s.kt)("p",null,"WordPress Playground build ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/php/php-src"},"the PHP interpreter")," to WebAssembly using ",(0,s.kt)("a",{parentName:"p",href:"https://emscripten.org/docs/porting/networking.html"},"Emscripten")," and a ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/WordPress/wordpress-playground/blob/0d451c33936a8db5b7a158fa8aad288c19370a7d/packages/php-wasm/compile/Dockerfile"},"dedicated pipeline"),"."),(0,s.kt)("p",null,(0,s.kt)("img",{alt:"Building C programs to WebAssembly",src:r(935).Z,width:"3456",height:"2234"})),(0,s.kt)("p",null,"Building PHP to WebAssembly is very similar to building vanilla PHP. The wasm build required ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/WordPress/wordpress-playground/blob/0d451c33936a8db5b7a158fa8aad288c19370a7d/packages/php-wasm/compile/build-assets/php7.1.patch#L8-L9"},"adjusting a function signature here"),", ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/WordPress/wordpress-playground/blob/0d451c33936a8db5b7a158fa8aad288c19370a7d/packages/php-wasm/compile/Dockerfile#L495"},"forcing a config variable there"),", and applying ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/WordPress/wordpress-playground/tree/0d451c33936a8db5b7a158fa8aad288c19370a7d/packages/php-wasm/compile/build-assets"},"a few small patches"),", but there's relatively few adjustments involved."),(0,s.kt)("p",null,(0,s.kt)("img",{alt:"Building PHP to WebAssembly",src:r(3860).Z,width:"3456",height:"2234"})),(0,s.kt)("p",null,"However, vanilla PHP builds aren't very useful in the browser. As a server software, PHP doesn't have a JavaScript API to pass the request body, upload files, or populate the ",(0,s.kt)("inlineCode",{parentName:"p"},"php://stdin")," stream. WordPress Playground had to build one from scratch. The WebAssembly binary comes with a ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/WordPress/wordpress-playground/blob/0d451c33936a8db5b7a158fa8aad288c19370a7d/packages/php-wasm/compile/build-assets/php_wasm.c"},"dedicated PHP API module")," written in C and a ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/WordPress/wordpress-playground/blob/da38192af57a95699d8731c855b82ac0222df61b/packages/php-wasm/common/src/lib/php.ts"},"JavaScript PHP class")," that exposes methods like writeFile() or run()."),(0,s.kt)("p",null,"Because every PHP version is just a static .wasm file, the PHP version switcher is actually pretty boring. It simply tells the browser to download, for example, ",(0,s.kt)("inlineCode",{parentName:"p"},"php_7_3.wasm")," instead of, say, ",(0,s.kt)("inlineCode",{parentName:"p"},"php_8_2.wasm"),"."),(0,s.kt)("p",null,(0,s.kt)("img",{alt:"Building different versions of PHP to WebAssembly",src:r(7805).Z,width:"3456",height:"2234"})),(0,s.kt)("h3",{id:"networking-support-varies-between-platforms"},"Networking support varies between platforms"),(0,s.kt)("p",null,"When it comes to networking, WebAssembly programs are limited to calling JavaScript APIs. It is a safety feature, but also presents a challenge. How do you support low-level, synchronous networking code used by PHP with the high-level asynchronous APIs available in JavaScript?"),(0,s.kt)("p",null,"In Node.js, the answer involves a WebSocket to TCP socket proxy, ",(0,s.kt)("a",{parentName:"p",href:"https://emscripten.org/docs/porting/asyncify.html"},"Asyncify"),", and patching deep PHP internals like php_select. It's complex, but there's a reward. The Node.js-targeted PHP build can request web APIs, install composer packages, and even connect to a MySQL server."),(0,s.kt)("p",null,"In the browser, networking is not supported yet. Initiating a HTTPS connection involves opening a raw TCP socket which is not possible in the browser. There is an ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/WordPress/wordpress-playground/issues/85"},"open GitHub issue")," that explores possible ways of addressing this problem."))}u.isMDXComponent=!0},9530:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>h});var a=r(2735);function s(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){s(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,a,s=function(e,t){if(null==e)return{};var r,a,s={},n=Object.keys(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||(s[r]=e[r]);return s}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(s[r]=e[r])}return s}var i=a.createContext({}),l=function(e){var t=a.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=l(e.components);return a.createElement(i.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var r=e.components,s=e.mdxType,n=e.originalType,i=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=l(r),m=s,h=d["".concat(i,".").concat(m)]||d[m]||u[m]||n;return r?a.createElement(h,o(o({ref:t},c),{},{components:r})):a.createElement(h,o({ref:t},c))}));function h(e,t){var r=arguments,s=t&&t.mdxType;if("string"==typeof e||s){var n=r.length,o=new Array(n);o[0]=m;var p={};for(var i in t)hasOwnProperty.call(t,i)&&(p[i]=t[i]);p.originalType=e,p[d]="string"==typeof e?e:s,o[1]=p;for(var l=2;l<n;l++)o[l]=r[l];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}m.displayName="MDXCreateElement"},935:(e,t,r)=>{r.d(t,{Z:()=>a});const a=r.p+"assets/images/c-programs-general-dc8c885b6c55e554f0c504f32e49ad8d.png"},7805:(e,t,r)=>{r.d(t,{Z:()=>a});const a=r.p+"assets/images/c-programs-php-versions-d204a7325079ab708fd605a6a1d2681b.png"},3860:(e,t,r)=>{r.d(t,{Z:()=>a});const a=r.p+"assets/images/c-programs-php-4a55d44329eb4e6403983664c6492f5b.png"}}]);