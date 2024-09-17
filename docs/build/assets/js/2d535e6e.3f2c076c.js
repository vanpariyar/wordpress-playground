"use strict";(self.webpackChunkdocusaurus_classic_typescript=self.webpackChunkdocusaurus_classic_typescript||[]).push([[7261],{1258:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>y,frontMatter:()=>a,metadata:()=>l,toc:()=>u});var n=r(11),i=(r(2735),r(9530));const a={title:"Getting started",slug:"/blueprints/getting-started"},o="Getting started with Blueprints",l={unversionedId:"blueprints/index",id:"blueprints/index",title:"Getting started",description:"Blueprints are JSON files for setting up your very own WordPress Playground instance. For example:",source:"@site/docs/blueprints/01-index.md",sourceDirName:"blueprints",slug:"/blueprints/getting-started",permalink:"/wordpress-playground/blueprints/getting-started",draft:!1,editUrl:"https://github.com/WordPress/wordpress-playground/tree/trunk/packages/docs/site/docs/blueprints/01-index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Getting started",slug:"/blueprints/getting-started"},sidebar:"blueprintsSidebar",previous:{title:"Introduction",permalink:"/wordpress-playground/blueprints"},next:{title:"Blueprints 101",permalink:"/wordpress-playground/blueprints/tutorial/"}},s={},u=[{value:"What problems are solved by Blueprints?",id:"what-problems-are-solved-by-blueprints",level:2},{value:"No coding skills required",id:"no-coding-skills-required",level:3},{value:"HTTP Requests are managed for you",id:"http-requests-are-managed-for-you",level:3},{value:"You can link to a Blueprint-preconfigured Playground",id:"you-can-link-to-a-blueprint-preconfigured-playground",level:3},{value:"Trusted by default",id:"trusted-by-default",level:3},{value:"Write it once, use it anywhere",id:"write-it-once-use-it-anywhere",level:3}],p=(d="BlueprintExample",function(e){return console.warn("Component "+d+" was not imported, exported, or provided by MDXProvider as global scope"),(0,i.kt)("div",e)});var d;const c={toc:u},g="wrapper";function y(e){let{components:t,...r}=e;return(0,i.kt)(g,(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"getting-started-with-blueprints"},"Getting started with Blueprints"),(0,i.kt)("p",null,"Blueprints are JSON files for setting up your very own WordPress Playground instance. For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "$schema": "https://playground.wordpress.net/blueprint-schema.json",\n    "landingPage": "/wp-admin/",\n    "preferredVersions": {\n        "php": "8.0",\n        "wp": "latest"\n    },\n    "phpExtensionBundles": ["kitchen-sink"],\n    "steps": [\n        {\n            "step": "login",\n            "username": "admin",\n            "password": "password"\n        }\n    ]\n}\n')),(0,i.kt)("p",null,"There are three ways to use Blueprints:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/wordpress-playground/blueprints/using-blueprints#url-fragment"},'Paste a Blueprint into the URL "fragment" on WordPress Playground website'),"."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/wordpress-playground/blueprints/using-blueprints#javascript-api"},"Use them with the JavaScript API"),"."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../developers/apis/query-api/"},"Reference a blueprint JSON file via QueryParam blueprint-url"))),(0,i.kt)("h2",{id:"what-problems-are-solved-by-blueprints"},"What problems are solved by Blueprints?"),(0,i.kt)("h3",{id:"no-coding-skills-required"},"No coding skills required"),(0,i.kt)("p",null,"Blueprints are just JSON. You don't need a development environment, any libraries, or even JavaScript knowledge. You can write them in any text editor."),(0,i.kt)("p",null,"However, if you do have a development environment, that's great! You can use the ",(0,i.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/blueprint-schema.json"},"Blueprint JSON schema")," to get autocompletion and validation."),(0,i.kt)("h3",{id:"http-requests-are-managed-for-you"},"HTTP Requests are managed for you"),(0,i.kt)("p",null,"Blueprints fetch any resources you declare for you. You don't have to worry about managing multiple ",(0,i.kt)("inlineCode",{parentName:"p"},"fetch()")," calls or waiting for them to finish. You can just declare a few links and let Blueprints handle and optimize the downloading pipeline."),(0,i.kt)("h3",{id:"you-can-link-to-a-blueprint-preconfigured-playground"},"You can link to a Blueprint-preconfigured Playground"),(0,i.kt)("p",null,"Because Blueprints can be pasted in the URL, you can embed or link to a Playground with a specific configuration. For example, clicking this button will open a Playground with PHP 7.4 and a pendant theme installed:"),(0,i.kt)(p,{justButton:!0,blueprint:{preferredVersions:{php:"7.4",wp:"latest"},steps:[{step:"installTheme",themeZipFile:{resource:"wordpress.org/themes",slug:"pendant"},options:{activate:!0}}]},mdxType:"BlueprintExample"}),(0,i.kt)("h3",{id:"trusted-by-default"},"Trusted by default"),(0,i.kt)("p",null,"Blueprints are just JSON. Running other people's Blueprints doesn't require the element of trust. Since Blueprints cannot execute arbitrary JavaScript, they are limited in what they can do."),(0,i.kt)("p",null,"With Blueprints, WordPress.org plugin directory may be able to offer live previews of plugins. Plugin authors will just write a custom Blueprint to preconfigure the Playground instance with any site options or starter content they may need."),(0,i.kt)("h3",{id:"write-it-once-use-it-anywhere"},"Write it once, use it anywhere"),(0,i.kt)("p",null,"Blueprints work both on the web and in node.js. You can run them both in the same JavaScript process, and through a remote Playground Client. They are the universal language of configuration. Where you can run Playground, you can use Blueprints."))}y.isMDXComponent=!0},9530:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>y});var n=r(2735);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var s=n.createContext({}),u=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},g=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=u(r),g=i,y=d["".concat(s,".").concat(g)]||d[g]||c[g]||a;return r?n.createElement(y,o(o({ref:t},p),{},{components:r})):n.createElement(y,o({ref:t},p))}));function y(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=g;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:i,o[1]=l;for(var u=2;u<a;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}g.displayName="MDXCreateElement"}}]);