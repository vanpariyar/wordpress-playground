"use strict";(self.webpackChunkdocusaurus_classic_typescript=self.webpackChunkdocusaurus_classic_typescript||[]).push([[7631,4587],{9011:(e,t,n)=>{n.d(t,{ZP:()=>p});var r=n(11),i=(n(2735),n(9530)),o=n(3355),a=n(7283);const s={toc:[]},l="wrapper";function p(e){let{components:t,...n}=e;return(0,i.kt)(l,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("div",{className:"margin-vert--sm"},!n.justButton&&(0,i.kt)(a.Z,{title:n.title,language:"json",mdxType:"CodeBlock"},n.display||JSON.stringify(n.blueprint,null,4)),(0,i.kt)(o.m,{blueprint:n.blueprint,mdxType:"BlueprintRunButton"})))}p.isMDXComponent=!0},776:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(2735),i=n(8349);const o={tableOfContentsInline:"tableOfContentsInline_moAP"};function a(e){let{toc:t,minHeadingLevel:n,maxHeadingLevel:a}=e;return r.createElement("div",{className:o.tableOfContentsInline},r.createElement(i.Z,{toc:t,minHeadingLevel:n,maxHeadingLevel:a,className:"table-of-contents",linkClassName:null}))}},8349:(e,t,n)=>{n.d(t,{Z:()=>u});var r=n(11),i=n(2735),o=n(7585),a=n(2555),s=n(9712);function l(e){let{toc:t,className:n,linkClassName:r,isChild:o}=e;return t.length?i.createElement("ul",{className:o?void 0:n},t.map((e=>i.createElement("li",{key:e.id},i.createElement("a",{href:`#${e.id}`,className:r??void 0,dangerouslySetInnerHTML:{__html:e.value}}),i.createElement(l,{isChild:!0,toc:e.children,className:n,linkClassName:r}))))):null}const p=i.memo(l);function u(e){let{toc:t,className:n="table-of-contents table-of-contents__left-border",linkClassName:l="table-of-contents__link",linkActiveClassName:u,minHeadingLevel:d,maxHeadingLevel:c,...m}=e;const h=(0,o.L)(),g=d??h.tableOfContents.minHeadingLevel,y=c??h.tableOfContents.maxHeadingLevel,f=(0,a.b)({toc:t,minHeadingLevel:g,maxHeadingLevel:y}),w=(0,i.useMemo)((()=>{if(l&&u)return{linkClassName:l,linkActiveClassName:u,minHeadingLevel:g,maxHeadingLevel:y}}),[l,u,g,y]);return(0,s.S)(w),i.createElement(p,(0,r.Z)({toc:f,className:n,linkClassName:l},m))}},9712:(e,t,n)=>{n.d(t,{S:()=>l});var r=n(2735),i=n(7585);function o(e){const t=e.getBoundingClientRect();return t.top===t.bottom?o(e.parentNode):t}function a(e,t){let{anchorTopOffset:n}=t;const r=e.find((e=>o(e).top>=n));if(r){return function(e){return e.top>0&&e.bottom<window.innerHeight/2}(o(r))?r:e[e.indexOf(r)-1]??null}return e[e.length-1]??null}function s(){const e=(0,r.useRef)(0),{navbar:{hideOnScroll:t}}=(0,i.L)();return(0,r.useEffect)((()=>{e.current=t?0:document.querySelector(".navbar").clientHeight}),[t]),e}function l(e){const t=(0,r.useRef)(void 0),n=s();(0,r.useEffect)((()=>{if(!e)return()=>{};const{linkClassName:r,linkActiveClassName:i,minHeadingLevel:o,maxHeadingLevel:s}=e;function l(){const e=function(e){return Array.from(document.getElementsByClassName(e))}(r),l=function(e){let{minHeadingLevel:t,maxHeadingLevel:n}=e;const r=[];for(let i=t;i<=n;i+=1)r.push(`h${i}.anchor`);return Array.from(document.querySelectorAll(r.join()))}({minHeadingLevel:o,maxHeadingLevel:s}),p=a(l,{anchorTopOffset:n.current}),u=e.find((e=>p&&p.id===function(e){return decodeURIComponent(e.href.substring(e.href.indexOf("#")+1))}(e)));e.forEach((e=>{!function(e,n){n?(t.current&&t.current!==e&&t.current.classList.remove(i),e.classList.add(i),t.current=e):e.classList.remove(i)}(e,e===u)}))}return document.addEventListener("scroll",l),document.addEventListener("resize",l),l(),()=>{document.removeEventListener("scroll",l),document.removeEventListener("resize",l)}}),[e,n])}},2555:(e,t,n)=>{n.d(t,{a:()=>o,b:()=>s});var r=n(2735);function i(e){const t=e.map((e=>({...e,parentIndex:-1,children:[]}))),n=Array(7).fill(-1);t.forEach(((e,t)=>{const r=n.slice(2,e.level);e.parentIndex=Math.max(...r),n[e.level]=t}));const r=[];return t.forEach((e=>{const{parentIndex:n,...i}=e;n>=0?t[n].children.push(i):r.push(i)})),r}function o(e){return(0,r.useMemo)((()=>i(e)),[e])}function a(e){let{toc:t,minHeadingLevel:n,maxHeadingLevel:r}=e;return t.flatMap((e=>{const t=a({toc:e.children,minHeadingLevel:n,maxHeadingLevel:r});return function(e){return e.level>=n&&e.level<=r}(e)?[{...e,children:t}]:t}))}function s(e){let{toc:t,minHeadingLevel:n,maxHeadingLevel:o}=e;return(0,r.useMemo)((()=>a({toc:i(t),minHeadingLevel:n,maxHeadingLevel:o})),[t,n,o])}},3355:(e,t,n)=>{n.d(t,{m:()=>i});var r=n(2735);function i(e){let{blueprint:t}=e;const[n,i]=r.useState(!1);if(!t)return null;if(!n)return r.createElement("button",{className:"button button--primary",onClick:()=>{i(!0)}},"Try it out!");const o=`https://playground.wordpress.net/?mode=seamless#${JSON.stringify(t)}`;return r.createElement("iframe",{style:{width:"100%",height:"500px",border:"1px solid #ccc"},src:o})}},7503:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(2735);const i={React:r,...r,css:{textarea:{width:"100%",height:"8lh",display:"block"}},HTML:e=>{let{children:t}=e;return r.createElement("div",{dangerouslySetInnerHTML:{__html:t}})}}},9038:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>d,default:()=>f,frontMatter:()=>u,metadata:()=>c,toc:()=>h});var r=n(11),i=(n(2735),n(9530)),o=n(776),a=n(7509),s=n(8033),l=n(2620),p=n(9011);const u={title:"Build your first app",slug:"/build-your-first-app"},d="Build an app with WordPress Playground in 5 minutes",c={unversionedId:"build-an-app/index",id:"build-an-app/index",title:"Build your first app",description:"WordPress Playground was created as a programmable tool. Below you'll find a few examples of what you can do with it. Each discussed API is described in detail in the APIs section:",source:"@site/docs/03-build-an-app/01-index.md",sourceDirName:"03-build-an-app",slug:"/build-your-first-app",permalink:"/wordpress-playground/docs/build-your-first-app",draft:!1,editUrl:"https://github.com/WordPress/wordpress-playground/tree/trunk/packages/docs/site/docs/03-build-an-app/01-index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Build your first app",slug:"/build-your-first-app"},sidebar:"tutorialSidebar",previous:{title:"Start using WordPress Playground in 5 minutes",permalink:"/wordpress-playground/docs/start-using"},next:{title:"Usage in Node.js",permalink:"/wordpress-playground/docs/usage-in-node-js"}},m={},h=[{value:"Embed WordPress on your website",id:"embed-wordpress-on-your-website",level:2},{value:"Control the embedded website",id:"control-the-embedded-website",level:2},{value:"Showcase a plugin or theme from WordPress directory",id:"showcase-a-plugin-or-theme-from-wordpress-directory",level:2},{value:"Showcase any plugin or theme",id:"showcase-any-plugin-or-theme",level:2},{value:"Preview pull requests from your repository",id:"preview-pull-requests-from-your-repository",level:2},{value:"Build a compatibility testing environment",id:"build-a-compatibility-testing-environment",level:2},{value:"Run PHP code in the browser",id:"run-php-code-in-the-browser",level:2}],g={toc:h},y="wrapper";function f(e){let{components:t,...n}=e;return(0,i.kt)(y,(0,r.Z)({},g,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"build-an-app-with-wordpress-playground-in-5-minutes"},"Build an app with WordPress Playground in 5 minutes"),(0,i.kt)("p",null,"WordPress Playground was created as a programmable tool. Below you'll find a few examples of what you can do with it. Each discussed API is described in detail in the ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/apis-overview"},"APIs section"),":"),(0,i.kt)(o.Z,{toc:h,mdxType:"TOCInline"}),(0,i.kt)("h2",{id:"embed-wordpress-on-your-website"},"Embed WordPress on your website"),(0,i.kt)("p",null,"Playground can be embedded on your website using the HTML ",(0,i.kt)("inlineCode",{parentName:"p"},"<iframe>")," tag as follows:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<iframe src="https://playground.wordpress.net/"></iframe>\n')),(0,i.kt)("p",null,"Every visitor will get their own private WordPress instance for free. You can then customize it using one of the ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/apis-overview"},"Playground APIs"),"."),(0,i.kt)(a.ZP,{mdxType:"PlaygroundWpNetWarning"}),(0,i.kt)("h2",{id:"control-the-embedded-website"},"Control the embedded website"),(0,i.kt)("p",null,"WordPress Playground provides three APIs you can use to control the iframed website. All the examples in this section are built using one of these:"),(0,i.kt)(s.ZP,{mdxType:"APIList"}),(0,i.kt)("p",null,"Learn more about each of these APIs in the ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/apis-overview"},"APIs overview section"),"."),(0,i.kt)("h2",{id:"showcase-a-plugin-or-theme-from-wordpress-directory"},"Showcase a plugin or theme from WordPress directory"),(0,i.kt)("p",null,"You can install plugins and themes from the WordPress directory with only URL parameters. For example this iframe would come with the ",(0,i.kt)("inlineCode",{parentName:"p"},"coblocks")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"friends")," plugins preinstalled as well as the ",(0,i.kt)("inlineCode",{parentName:"p"},"pendant")," theme."),(0,i.kt)(l.ZP,{mdxType:"ThisIsQueryApi"}),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<iframe src="https://playground.wordpress.net/?plugin=coblocks"></iframe>\n')),(0,i.kt)("h2",{id:"showcase-any-plugin-or-theme"},"Showcase any plugin or theme"),(0,i.kt)("p",null,"What if your plugin is not in the WordPress directory?"),(0,i.kt)("p",null,"You can still showcase it on Playground by using ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/blueprints-api/index"},"JSON Blueprints"),". For example, this Blueprint would download and install a plugin and a theme from your website and also import some starter content:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "steps": [\n        {\n            "step": "installPlugin",\n            "pluginZipFile": {\n                "resource": "url",\n                "url": "https://your-site.com/your-plugin.zip"\n            }\n        },\n        {\n            "step": "installTheme",\n            "pluginZipFile": {\n                "resource": "url",\n                "url": "https://your-site.com/your-theme.zip"\n            }\n        },\n        {\n            "step": "importFile",\n            "pluginZipFile": {\n                "resource": "url",\n                "url": "https://your-site.com/starter-content.wxz"\n            }\n        }\n    ]\n}\n')),(0,i.kt)("p",null,"See ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/blueprints-api/index"},"getting started with Blueprints")," to learn more."),(0,i.kt)("h2",{id:"preview-pull-requests-from-your-repository"},"Preview pull requests from your repository"),(0,i.kt)("p",null,"You can use Playground as a Pull Request previewer if:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Your WordPress plugin or theme uses a CI pipeline"),(0,i.kt)("li",{parentName:"ul"},"Your CI pipeline bundles your plugin or theme"),(0,i.kt)("li",{parentName:"ul"},"You can expose the zip file generated by your CI pipeline publicly")),(0,i.kt)("p",null,"Those zip bundles aren't any different from regular WordPress Plugins, which means you can install them in Playground using the ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/blueprints-api/index"},"JSON Blueprints")," API. Once you exposed an endpoint like ",(0,i.kt)("a",{parentName:"p",href:"https://your-site.com/pull-request-1234.zip"},"https://your-site.com/pull-request-1234.zip"),", the following Blueprint will do the rest:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "steps": [\n        {\n            "step": "installPlugin",\n            "pluginZipFile": {\n                "resource": "url",\n                "url": "https://your-site.com/pull-request-1234.zip"\n            }\n        }\n    ]\n}\n')),(0,i.kt)("p",null,"The official Playground demo uses this technique to preview pull requests from the Gutenberg repository:"),(0,i.kt)(p.ZP,{blueprint:{landingPage:"/wp-admin/plugins.php?test=42test",preferredVersions:{php:"7.4"},steps:[{step:"login"},{step:"mkdir",path:"/wordpress/pr"},{"//":"GitHub provides doubly zipped files so we'll save it first",step:"writeFile",path:"/wordpress/pr/pr.zip",data:{resource:"url",url:"/plugin-proxy?pr=47739&org=WordPress&repo=gutenberg&workflow=Build%20Gutenberg%20Plugin%20Zip&artifact=gutenberg-plugin",caption:"Downloading Gutenberg PR 47739"},progress:{weight:2,caption:"Applying Gutenberg PR 47739"}},{"//":"Unzip the outer zip",step:"unzip",zipPath:"/wordpress/pr/pr.zip",extractToPath:"/wordpress/pr"},{"//":"And install the inner zip!",step:"installPlugin",pluginZipFile:{resource:"vfs",path:"/wordpress/pr/gutenberg.zip"}}]},mdxType:"BlueprintExample"}),(0,i.kt)("h2",{id:"build-a-compatibility-testing-environment"},"Build a compatibility testing environment"),(0,i.kt)("p",null,"A live plugin demo with a configurable PHP and WordPress makes an excellent compatibility testing environment."),(0,i.kt)("p",null,"With the Query API, you'd simply add the ",(0,i.kt)("inlineCode",{parentName:"p"},"php")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"wp")," query parameters to the URL:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<iframe src="https://playground.wordpress.net/?php=7.4&wp=6.1"></iframe>\n')),(0,i.kt)("p",null,"With JSON Blueprints, you'd use the ",(0,i.kt)("inlineCode",{parentName:"p"},"preferredVersions")," property:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "preferredVersions": {\n        "php": "7.4",\n        "wp": "6.1"\n    }\n}\n')),(0,i.kt)("h2",{id:"run-php-code-in-the-browser"},"Run PHP code in the browser"),(0,i.kt)("p",null,"The JavaScript API provides the ",(0,i.kt)("inlineCode",{parentName:"p"},"run()")," method which you can use to run PHP code in the browser:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<iframe id="wp"></iframe>\n<script type="module">\n    const client = await startPlaygroundWeb({\n        iframe: document.getElementById(\'wp\'),\n        remoteUrl: \'https://playground.wordpress.net/remote.html\',\n    });\n    await client.isReady;\n    await client.run({\n        code: `<?php\n        require("/wordpress/wp-load.php");\n\n        update_option("blogname", "Playground is really cool!");\n        echo "Site title updated!";\n        `,\n    });\n    client.goTo(\'/\');\n<\/script>\n')),(0,i.kt)("p",null,"Combine that with a code editor like Monako or CodeMirror, and you'll get live code snippets like in ",(0,i.kt)("a",{parentName:"p",href:"https://adamadam.blog/2023/02/16/how-to-modify-html-in-a-php-wordpress-plugin-using-the-new-tag-processor-api/"},"this article"),"!"))}f.isMDXComponent=!0},8033:(e,t,n)=>{n.d(t,{ZP:()=>s});var r=n(11),i=(n(2735),n(9530));const o={toc:[]},a="wrapper";function s(e){let{components:t,...n}=e;return(0,i.kt)(a,(0,r.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/wordpress-playground/docs/query-api"},"Query API")," enable basic operations using only query parameters"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/wordpress-playground/docs/blueprints-api/index"},"JSON Blueprints")," give you a great degree of control with a simple JSON file"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"/wordpress-playground/docs/javascript-api/index"},"JavaScript API")," give you full control via a JavaScript client from an npm package")))}s.isMDXComponent=!0},7509:(e,t,n)=>{n.d(t,{ZP:()=>s});var r=n(11),i=(n(2735),n(9530));const o={toc:[]},a="wrapper";function s(e){let{components:t,...n}=e;return(0,i.kt)(a,(0,r.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("admonition",{title:"Careful with the demo site",type:"danger"},(0,i.kt)("p",{parentName:"admonition"},"The site at ",(0,i.kt)("a",{parentName:"p",href:"https://playground.wordpress.net"},"https://playground.wordpress.net")," is there to support the community, but there are no guarantees it will continue to work if the traffic grows significantly."),(0,i.kt)("p",{parentName:"admonition"},"If you need certain availability, you should host your own WordPress Playground copy.")))}s.isMDXComponent=!0},2620:(e,t,n)=>{n.d(t,{ZP:()=>s});var r=n(11),i=(n(2735),n(9530));const o={toc:[]},a="wrapper";function s(e){let{components:t,...n}=e;return(0,i.kt)(a,(0,r.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"This is called ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/query-api"},"Query API")," and you can learn more about it ",(0,i.kt)("a",{parentName:"p",href:"/wordpress-playground/docs/query-api"},"here"),"."))}s.isMDXComponent=!0}}]);