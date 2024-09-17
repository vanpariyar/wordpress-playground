"use strict";(self.webpackChunkdocusaurus_classic_typescript=self.webpackChunkdocusaurus_classic_typescript||[]).push([[8713],{776:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(2735),a=n(8349);const o={tableOfContentsInline:"tableOfContentsInline_moAP"};function i(e){let{toc:t,minHeadingLevel:n,maxHeadingLevel:i}=e;return r.createElement("div",{className:o.tableOfContentsInline},r.createElement(a.Z,{toc:t,minHeadingLevel:n,maxHeadingLevel:i,className:"table-of-contents",linkClassName:null}))}},8349:(e,t,n)=>{n.d(t,{Z:()=>u});var r=n(11),a=n(2735),o=n(7585),i=n(2555),s=n(9712);function l(e){let{toc:t,className:n,linkClassName:r,isChild:o}=e;return t.length?a.createElement("ul",{className:o?void 0:n},t.map((e=>a.createElement("li",{key:e.id},a.createElement("a",{href:`#${e.id}`,className:r??void 0,dangerouslySetInnerHTML:{__html:e.value}}),a.createElement(l,{isChild:!0,toc:e.children,className:n,linkClassName:r}))))):null}const p=a.memo(l);function u(e){let{toc:t,className:n="table-of-contents table-of-contents__left-border",linkClassName:l="table-of-contents__link",linkActiveClassName:u,minHeadingLevel:d,maxHeadingLevel:c,...m}=e;const h=(0,o.L)(),g=d??h.tableOfContents.minHeadingLevel,f=c??h.tableOfContents.maxHeadingLevel,y=(0,i.b)({toc:t,minHeadingLevel:g,maxHeadingLevel:f}),v=(0,a.useMemo)((()=>{if(l&&u)return{linkClassName:l,linkActiveClassName:u,minHeadingLevel:g,maxHeadingLevel:f}}),[l,u,g,f]);return(0,s.S)(v),a.createElement(p,(0,r.Z)({toc:y,className:n,linkClassName:l},m))}},9712:(e,t,n)=>{n.d(t,{S:()=>l});var r=n(2735),a=n(7585);function o(e){const t=e.getBoundingClientRect();return t.top===t.bottom?o(e.parentNode):t}function i(e,t){let{anchorTopOffset:n}=t;const r=e.find((e=>o(e).top>=n));if(r){return function(e){return e.top>0&&e.bottom<window.innerHeight/2}(o(r))?r:e[e.indexOf(r)-1]??null}return e[e.length-1]??null}function s(){const e=(0,r.useRef)(0),{navbar:{hideOnScroll:t}}=(0,a.L)();return(0,r.useEffect)((()=>{e.current=t?0:document.querySelector(".navbar").clientHeight}),[t]),e}function l(e){const t=(0,r.useRef)(void 0),n=s();(0,r.useEffect)((()=>{if(!e)return()=>{};const{linkClassName:r,linkActiveClassName:a,minHeadingLevel:o,maxHeadingLevel:s}=e;function l(){const e=function(e){return Array.from(document.getElementsByClassName(e))}(r),l=function(e){let{minHeadingLevel:t,maxHeadingLevel:n}=e;const r=[];for(let a=t;a<=n;a+=1)r.push(`h${a}.anchor`);return Array.from(document.querySelectorAll(r.join()))}({minHeadingLevel:o,maxHeadingLevel:s}),p=i(l,{anchorTopOffset:n.current}),u=e.find((e=>p&&p.id===function(e){return decodeURIComponent(e.href.substring(e.href.indexOf("#")+1))}(e)));e.forEach((e=>{!function(e,n){n?(t.current&&t.current!==e&&t.current.classList.remove(a),e.classList.add(a),t.current=e):e.classList.remove(a)}(e,e===u)}))}return document.addEventListener("scroll",l),document.addEventListener("resize",l),l(),()=>{document.removeEventListener("scroll",l),document.removeEventListener("resize",l)}}),[e,n])}},2555:(e,t,n)=>{n.d(t,{a:()=>o,b:()=>s});var r=n(2735);function a(e){const t=e.map((e=>({...e,parentIndex:-1,children:[]}))),n=Array(7).fill(-1);t.forEach(((e,t)=>{const r=n.slice(2,e.level);e.parentIndex=Math.max(...r),n[e.level]=t}));const r=[];return t.forEach((e=>{const{parentIndex:n,...a}=e;n>=0?t[n].children.push(a):r.push(a)})),r}function o(e){return(0,r.useMemo)((()=>a(e)),[e])}function i(e){let{toc:t,minHeadingLevel:n,maxHeadingLevel:r}=e;return t.flatMap((e=>{const t=i({toc:e.children,minHeadingLevel:n,maxHeadingLevel:r});return function(e){return e.level>=n&&e.level<=r}(e)?[{...e,children:t}]:t}))}function s(e){let{toc:t,minHeadingLevel:n,maxHeadingLevel:o}=e;return(0,r.useMemo)((()=>i({toc:a(t),minHeadingLevel:n,maxHeadingLevel:o})),[t,n,o])}},2620:(e,t,n)=>{n.d(t,{ZP:()=>s});var r=n(11),a=(n(2735),n(9530));const o={toc:[]},i="wrapper";function s(e){let{components:t,...n}=e;return(0,a.kt)(i,(0,r.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"This is called ",(0,a.kt)("a",{parentName:"p",href:"/developers/apis/query-api/"},"Query API")," and you can learn more about it ",(0,a.kt)("a",{parentName:"p",href:"/developers/apis/query-api/"},"here"),"."))}s.isMDXComponent=!0},5646:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>h,frontMatter:()=>s,metadata:()=>p,toc:()=>d});var r=n(11),a=(n(2735),n(9530)),o=n(2620),i=n(776);const s={title:"Quick Start Guide",slug:"/quick-start-guide"},l="Start using WordPress Playground in 5 minutes",p={unversionedId:"main/quick-start-guide",id:"main/quick-start-guide",title:"Quick Start Guide",description:"WordPress Playground can help you with any of the following:",source:"@site/docs/main/quick-start-guide.md",sourceDirName:"main",slug:"/quick-start-guide",permalink:"/wordpress-playground/quick-start-guide",draft:!1,editUrl:"https://github.com/WordPress/wordpress-playground/tree/trunk/packages/docs/site/docs/main/quick-start-guide.md",tags:[],version:"current",frontMatter:{title:"Quick Start Guide",slug:"/quick-start-guide"},sidebar:"mainSidebar",previous:{title:"Introduction",permalink:"/wordpress-playground/"},next:{title:"Playground web instance",permalink:"/wordpress-playground/web-instance"}},u={},d=[{value:"Start a new WordPress site",id:"start-a-new-wordpress-site",level:2},{value:"Try a block, a theme, or a plugin",id:"try-a-block-a-theme-or-a-plugin",level:2},{value:"Save your site",id:"save-your-site",level:2},{value:"Restore a saved site",id:"restore-a-saved-site",level:2},{value:"Use a specific WordPress or PHP version",id:"use-a-specific-wordpress-or-php-version",level:2},{value:"Import a WXR file",id:"import-a-wxr-file",level:2},{value:"Build apps with WordPress Playground",id:"build-apps-with-wordpress-playground",level:2}],c={toc:d},m="wrapper";function h(e){let{components:t,...s}=e;return(0,a.kt)(m,(0,r.Z)({},c,s,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"start-using-wordpress-playground-in-5-minutes"},"Start using WordPress Playground in 5 minutes"),(0,a.kt)("p",null,"WordPress Playground can help you with any of the following:"),(0,a.kt)(i.Z,{toc:d,mdxType:"TOCInline"}),(0,a.kt)("p",null,"This page will guide you through each of these. Oh, and if you're a visual learner \u2013 here's a video:"),(0,a.kt)("iframe",{width:"752",height:"423.2",title:"Getting started with WordPress Playground",src:"https://video.wordpress.com/v/3UBIXJ9S?autoPlay=false&height=1080&width=1920&fill=true",class:"editor-media-modal-detail__preview is-video"}),(0,a.kt)("h2",{id:"start-a-new-wordpress-site"},"Start a new WordPress site"),(0,a.kt)("p",null,"Every time you visit the ",(0,a.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/"},"official demo on playground.wordpress.net"),", you get a fresh WordPress site."),(0,a.kt)("p",null,"You can then create pages, upload plugins, themes, import your own site, and do most things you would do on a regular WordPress."),(0,a.kt)("p",null,"It's that easy to start!"),(0,a.kt)("p",null,"The entire site lives in your browser and is scraped when you close the tab. Want to start over? Just refresh the page!"),(0,a.kt)("admonition",{title:"WordPress Playground is private",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Everything you build stays in your browser and is ",(0,a.kt)("strong",{parentName:"p"},"not")," sent anywhere. Once you're finished, you can export your site as a zip file. Or just refresh the page and start over!")),(0,a.kt)("h2",{id:"try-a-block-a-theme-or-a-plugin"},"Try a block, a theme, or a plugin"),(0,a.kt)("p",null,"You can upload any plugin or theme you want in ",(0,a.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/?url=/wp-admin/"},"/wp-admin/"),"."),(0,a.kt)("p",null,"To save a few clicks, you can preinstall plugins or themes from the WordPress plugin directory by adding a ",(0,a.kt)("inlineCode",{parentName:"p"},"plugin")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"theme")," parameter to the URL. For example, to install the coblocks plugin, you can use this URL:"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/?plugin=coblocks"},"https://playground.wordpress.net/?plugin=coblocks")),(0,a.kt)("p",null,"Or this URL to preinstall the ",(0,a.kt)("inlineCode",{parentName:"p"},"pendant")," theme:"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/?theme=pendant"},"https://playground.wordpress.net/?theme=pendant")),(0,a.kt)("p",null,"You can also mix and match these parameters and even add multiple plugins:"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/?plugin=coblocks&plugin=friends&theme=pendant"},"https://playground.wordpress.net/?plugin=coblocks&plugin=friends&theme=pendant")),(0,a.kt)(o.ZP,{mdxType:"ThisIsQueryApi"}),(0,a.kt)("admonition",{title:"Plugin directory doesn't work in WordPress Playground",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Plugins must be installed manually because your WordPress site doesn't send any data to the internet. You won't be able to navigate the WordPress plugin directory inside ",(0,a.kt)("inlineCode",{parentName:"p"},"/wp-admin/"),". The Query API method may seem to contradict that, but behind the scenes it uses the same plugin upload form as you would.")),(0,a.kt)("h2",{id:"save-your-site"},"Save your site"),(0,a.kt)("p",null,"To keep your WordPress Playground site for longer than a single browser session, you can export it as a zip file."),(0,a.kt)("p",null,'Use the "Export" button in the top bar:'),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Export button",src:n(8655).Z,width:"878",height:"544"})),(0,a.kt)("p",null,"The exported file contains the complete site you've built. You could host it on any server that supports PHP and SQLite. All WordPress core files, plugins, themes, and everything else you've added to your site are in there."),(0,a.kt)("p",null,"The SQLite database file is also included in the export, you'll find it ",(0,a.kt)("inlineCode",{parentName:"p"},"wp-content/database/.ht.sqlite"),'. Keep in mind that files starting with a dot are hidden by default on most operating systems so you might need to enable the "Show hidden files" option in your file manager.'),(0,a.kt)("h2",{id:"restore-a-saved-site"},"Restore a saved site"),(0,a.kt)("p",null,"You can restore the site you saved by using the import button in WordPress Playground:"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Import button",src:n(9138).Z,width:"818",height:"590"})),(0,a.kt)("h2",{id:"use-a-specific-wordpress-or-php-version"},"Use a specific WordPress or PHP version"),(0,a.kt)("p",null,"The easiest way is to use the version switcher on ",(0,a.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/"},"the official demo site"),":"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"WordPress Version switcher",src:n(7540).Z,width:"2476",height:"1888"})),(0,a.kt)("admonition",{title:"Test your plugin or theme",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Compatibility testing with so many WordPres and PHP versions was always a pain. WordPress Playground makes this process effortless \u2013 use it to your advantage!")),(0,a.kt)("p",null,"You can also use the ",(0,a.kt)("inlineCode",{parentName:"p"},"wp")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"php")," query parameters to open Playground with the right versions already loaded:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://playground.wordpress.net/?wp=6.5"},"https://playground.wordpress.net/?wp=6.5")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://playground.wordpress.net/?php=7.4"},"https://playground.wordpress.net/?php=7.4")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://playground.wordpress.net/?php=8.2&wp=6.2"},"https://playground.wordpress.net/?php=8.2&wp=6.2"))),(0,a.kt)(o.ZP,{mdxType:"ThisIsQueryApi"}),(0,a.kt)("admonition",{title:"Major versions only",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"You can specify major versions like ",(0,a.kt)("inlineCode",{parentName:"p"},"wp=6.2")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"php=8.1")," and expect the most recent release in that line. You cannot, however, request older minor versions so neither ",(0,a.kt)("inlineCode",{parentName:"p"},"wp=6.1.2")," nor ",(0,a.kt)("inlineCode",{parentName:"p"},"php=7.4.9")," will work.")),(0,a.kt)("h2",{id:"import-a-wxr-file"},"Import a WXR file"),(0,a.kt)("p",null,"You can import a WordPress export file by uploading a WXR file in ",(0,a.kt)("a",{parentName:"p",href:"https://playground.wordpress.net/?url=/wp-admin/import.php"},"/wp-admin/"),"."),(0,a.kt)("p",null,"You can also use ",(0,a.kt)("a",{parentName:"p",href:"/wordpress-playground/blueprints/getting-started"},"JSON Blueprints"),". See ",(0,a.kt)("a",{parentName:"p",href:"/wordpress-playground/blueprints/getting-started"},"getting started with Blueprints")," to learn more."),(0,a.kt)("p",null,"This is different from the import feature described above. The import feature exports the entire site, including the database. This import feature imports a WXR file into an existing site."),(0,a.kt)("h2",{id:"build-apps-with-wordpress-playground"},"Build apps with WordPress Playground"),(0,a.kt)("p",null,"WordPress Playground is programmable which means you can build WordPress apps, setup plugin demos, and even use it as a zero-setup local development environment."),(0,a.kt)("p",null,"To learn more about developing with WordPress Playground, check out the ",(0,a.kt)("a",{parentName:"p",href:"/wordpress-playground/developers/build-your-first-app"},"development quick start")," section."))}h.isMDXComponent=!0},9530:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>h});var r=n(2735);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=p(n),m=a,h=d["".concat(l,".").concat(m)]||d[m]||c[m]||o;return n?r.createElement(h,i(i({ref:t},u),{},{components:n})):r.createElement(h,i({ref:t},u))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},8655:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/export-button-784333dab5d84d002a3a1ec8f5b6d43c.png"},9138:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/import-button-b3369a17efea29cd4edb43b7968b27a5.png"},7540:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/wp-version-switcher-358d5c20145c11cd2b58c9397866a68e.png"}}]);