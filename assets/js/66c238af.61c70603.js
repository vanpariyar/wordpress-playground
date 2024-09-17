"use strict";(self.webpackChunkdocusaurus_classic_typescript=self.webpackChunkdocusaurus_classic_typescript||[]).push([[1073],{1127:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>i,contentTitle:()=>l,default:()=>f,frontMatter:()=>s,metadata:()=>a,toc:()=>c});var t=n(11),o=(n(2735),n(9530));const s={sidebar_position:2},l="Resources",a={unversionedId:"blueprints-api/resources",id:"blueprints-api/resources",title:"Resources",description:"Resource References allow you use external files in Blueprints",source:"@site/docs/09-blueprints-api/04-resources.md",sourceDirName:"09-blueprints-api",slug:"/blueprints-api/resources",permalink:"/wordpress-playground/docs/blueprints-api/resources",draft:!1,editUrl:"https://github.com/WordPress/wordpress-playground/tree/trunk/packages/docs/site/docs/09-blueprints-api/04-resources.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Using Blueprints",permalink:"/wordpress-playground/docs/blueprints-api/using-blueprints"},next:{title:"Steps",permalink:"/wordpress-playground/docs/blueprints-api/steps"}},i={},c=[{value:"URLReference",id:"urlreference",level:3},{value:"CoreThemeReference",id:"corethemereference",level:3},{value:"CorePluginReference",id:"corepluginreference",level:3},{value:"VFSReference",id:"vfsreference",level:3},{value:"LiteralReference",id:"literalreference",level:3}],u={toc:c},p="wrapper";function f(e){let{components:r,...n}=e;return(0,o.kt)(p,(0,t.Z)({},u,n,{components:r,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"resources"},"Resources"),(0,o.kt)("p",null,"Resource References allow you use external files in Blueprints"),(0,o.kt)("p",null,"In the ",(0,o.kt)("inlineCode",{parentName:"p"},"installPlugin")," step in the example above, we reference the ",(0,o.kt)("inlineCode",{parentName:"p"},"https://downloads.wordpress.org/plugins/friends.latest-stable.zip")," file by using the ",(0,o.kt)("inlineCode",{parentName:"p"},"wordpress.org/plugins")," resource reference."),(0,o.kt)("p",null,"The following resource references are available:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#urlreference"},"URLReference")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#corethemereference"},"CoreThemeReference")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#corepluginreference"},"CorePluginReference")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#vfsreference"},"VFSReference")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#literalreference"},"LiteralReference"))),(0,o.kt)("h3",{id:"urlreference"},"URLReference"),(0,o.kt)("p",null,"The URLReference resource is used to reference files that are stored on a remote server. The URLReference resource is defined as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"type URLReference = {\n    resource: 'url';\n    url: string;\n};\n")),(0,o.kt)("p",null,'To use the URLReference resource, you need to provide the URL of the file. For example, to reference a file named "index.html" that is stored on a remote server, you can create a URLReference as follows:'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "resource": "url",\n    "url": "https://example.com/index.html"\n}\n')),(0,o.kt)("h3",{id:"corethemereference"},"CoreThemeReference"),(0,o.kt)("p",null,"The CoreThemeReference resource is used to reference WordPress core themes. The CoreThemeReference resource is defined as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"type CoreThemeReference = {\n    resource: 'wordpress.org/themes';\n    slug: string;\n    version?: string;\n};\n")),(0,o.kt)("p",null,'To use the CoreThemeReference resource, you need to provide the slug of the theme. For example, to reference the "Twenty Twenty-One" theme, you can create a CoreThemeReference as follows:'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "resource": "wordpress.org/themes",\n    "slug": "twentytwentyone"\n}\n')),(0,o.kt)("h3",{id:"corepluginreference"},"CorePluginReference"),(0,o.kt)("p",null,"The CorePluginReference resource is used to reference WordPress core plugins. The CorePluginReference resource is defined as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"type CorePluginReference = {\n    resource: 'wordpress.org/plugins';\n    slug: string;\n    version?: string;\n};\n")),(0,o.kt)("p",null,'To use the CorePluginReference resource, you need to provide the slug of the plugin. For example, to reference the "Akismet" plugin, you can create a CorePluginReference as follows:'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "resource": "wordpress.org/plugins",\n    "slug": "akismet"\n}\n')),(0,o.kt)("h3",{id:"vfsreference"},"VFSReference"),(0,o.kt)("p",null,"The VFSReference resource is used to reference files that are stored in a virtual file system (VFS). The VFS is a file system that is stored in memory and can be used to store files that are not part of the file system of the operating system. The VFSReference resource is defined as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"type VFSReference = {\n    resource: 'vfs';\n    path: string;\n};\n")),(0,o.kt)("p",null,'To use the VFSReference resource, you need to provide the path to the file in the VFS. For example, to reference a file named "index.html" that is stored in the root of the VFS, you can create a VFSReference as follows:'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "resource": "vfs",\n    "path": "/index.html"\n}\n')),(0,o.kt)("h3",{id:"literalreference"},"LiteralReference"),(0,o.kt)("p",null,"The LiteralReference resource is used to reference files that are stored as literals in the code. The LiteralReference resource is defined as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"type LiteralReference = {\n    resource: 'literal';\n    name: string;\n    contents: string | Uint8Array;\n};\n")),(0,o.kt)("p",null,'To use the LiteralReference resource, you need to provide the name of the file and its contents. For example, to reference a file named "index.html" that contains the text "Hello, World!", you can create a LiteralReference as follows:'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "resource": "literal",\n    "name": "index.html",\n    "contents": "Hello, World!"\n}\n')))}f.isMDXComponent=!0},9530:(e,r,n)=>{n.d(r,{Zo:()=>u,kt:()=>m});var t=n(2735);function o(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function s(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function l(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?s(Object(n),!0).forEach((function(r){o(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function a(e,r){if(null==e)return{};var n,t,o=function(e,r){if(null==e)return{};var n,t,o={},s=Object.keys(e);for(t=0;t<s.length;t++)n=s[t],r.indexOf(n)>=0||(o[n]=e[n]);return o}(e,r);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(t=0;t<s.length;t++)n=s[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var i=t.createContext({}),c=function(e){var r=t.useContext(i),n=r;return e&&(n="function"==typeof e?e(r):l(l({},r),e)),n},u=function(e){var r=c(e.components);return t.createElement(i.Provider,{value:r},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},d=t.forwardRef((function(e,r){var n=e.components,o=e.mdxType,s=e.originalType,i=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),p=c(n),d=o,m=p["".concat(i,".").concat(d)]||p[d]||f[d]||s;return n?t.createElement(m,l(l({ref:r},u),{},{components:n})):t.createElement(m,l({ref:r},u))}));function m(e,r){var n=arguments,o=r&&r.mdxType;if("string"==typeof e||o){var s=n.length,l=new Array(s);l[0]=d;var a={};for(var i in r)hasOwnProperty.call(r,i)&&(a[i]=r[i]);a.originalType=e,a[p]="string"==typeof e?e:o,l[1]=a;for(var c=2;c<s;c++)l[c]=n[c];return t.createElement.apply(null,l)}return t.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);