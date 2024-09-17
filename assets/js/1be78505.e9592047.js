"use strict";(self.webpackChunkdocusaurus_classic_typescript=self.webpackChunkdocusaurus_classic_typescript||[]).push([[9514,5172],{8189:(e,t,n)=>{n.r(t),n.d(t,{default:()=>Ee});var a=n(2735),l=n(45),o=n(421),r=n(1497),c=n(7400),i=n(5741),s=n(6590),d=n(5131),m=n(7025),u=n(4094),b=n(9615);const p={backToTopButton:"backToTopButton_m21v",backToTopButtonShow:"backToTopButtonShow_cmQj"};function h(){const{shown:e,scrollToTop:t}=(0,b.a)({threshold:300});return a.createElement("button",{"aria-label":(0,u.I)({id:"theme.BackToTopButton.buttonAriaLabel",message:"Scroll back to top",description:"The ARIA label for the back to top button"}),className:(0,l.Z)("clean-btn",r.k.common.backToTopButton,p.backToTopButton,e&&p.backToTopButtonShow),type:"button",onClick:t})}var E=n(9850),f=n(3038),g=n(601),k=n(7585),v=n(8644),_=n(11);function C(e){return a.createElement("svg",(0,_.Z)({width:"20",height:"20","aria-hidden":"true"},e),a.createElement("g",{fill:"#7a7a7a"},a.createElement("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),a.createElement("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})))}const S={collapseSidebarButton:"collapseSidebarButton_ZE0Y",collapseSidebarButtonIcon:"collapseSidebarButtonIcon_CU6Y"};function I(e){let{onClick:t}=e;return a.createElement("button",{type:"button",title:(0,u.I)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,u.I)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,l.Z)("button button--secondary button--outline",S.collapseSidebarButton),onClick:t},a.createElement(C,{className:S.collapseSidebarButtonIcon}))}var N=n(6533),T=n(852),Z=n(3603),x=n(2936),B=n(9371),y=n(3315),w=n(7253),A=n(9806);function L(e){let{categoryLabel:t,onClick:n}=e;return a.createElement("button",{"aria-label":(0,u.I)({id:"theme.DocSidebarItem.toggleCollapsedCategoryAriaLabel",message:"Toggle the collapsible sidebar category '{label}'",description:"The ARIA label to toggle the collapsible sidebar category"},{label:t}),type:"button",className:"clean-btn menu__caret",onClick:n})}function H(e){let{item:t,onItemClick:n,activePath:o,level:c,index:s,...d}=e;const{items:m,label:u,collapsible:b,className:p,href:h}=t,{docs:{sidebar:{autoCollapseCategories:E}}}=(0,k.L)(),f=function(e){const t=(0,A.Z)();return(0,a.useMemo)((()=>e.href?e.href:!t&&e.collapsible?(0,i.Wl)(e):void 0),[e,t])}(t),g=(0,i._F)(t,o),v=(0,y.Mg)(h,o),{collapsed:C,setCollapsed:S}=(0,B.u)({initialState:()=>!!b&&(!g&&t.collapsed)}),{expandedItem:I,setExpandedItem:N}=(0,Z.f)(),T=function(e){void 0===e&&(e=!C),N(e?null:s),S(e)};return function(e){let{isActive:t,collapsed:n,updateCollapsed:l}=e;const o=(0,x.D9)(t);(0,a.useEffect)((()=>{t&&!o&&n&&l(!1)}),[t,o,n,l])}({isActive:g,collapsed:C,updateCollapsed:T}),(0,a.useEffect)((()=>{b&&null!=I&&I!==s&&E&&S(!0)}),[b,I,s,S,E]),a.createElement("li",{className:(0,l.Z)(r.k.docs.docSidebarItemCategory,r.k.docs.docSidebarItemCategoryLevel(c),"menu__list-item",{"menu__list-item--collapsed":C},p)},a.createElement("div",{className:(0,l.Z)("menu__list-item-collapsible",{"menu__list-item-collapsible--active":v})},a.createElement(w.default,(0,_.Z)({className:(0,l.Z)("menu__link",{"menu__link--sublist":b,"menu__link--sublist-caret":!h&&b,"menu__link--active":g}),onClick:b?e=>{n?.(t),h?T(!1):(e.preventDefault(),T())}:()=>{n?.(t)},"aria-current":v?"page":void 0,"aria-expanded":b?!C:void 0,href:b?f??"#":f},d),u),h&&b&&a.createElement(L,{categoryLabel:u,onClick:e=>{e.preventDefault(),T()}})),a.createElement(B.z,{lazy:!0,as:"ul",className:"menu__list",collapsed:C},a.createElement(U,{items:m,tabIndex:C?-1:0,onItemClick:n,activePath:o,level:c+1})))}var M=n(3689),F=n(4790);const P={menuExternalLink:"menuExternalLink_pfmR"};function W(e){let{item:t,onItemClick:n,activePath:o,level:c,index:s,...d}=e;const{href:m,label:u,className:b,autoAddBaseUrl:p}=t,h=(0,i._F)(t,o),E=(0,M.Z)(m);return a.createElement("li",{className:(0,l.Z)(r.k.docs.docSidebarItemLink,r.k.docs.docSidebarItemLinkLevel(c),"menu__list-item",b),key:u},a.createElement(w.default,(0,_.Z)({className:(0,l.Z)("menu__link",!E&&P.menuExternalLink,{"menu__link--active":h}),autoAddBaseUrl:p,"aria-current":h?"page":void 0,to:m},E&&{onClick:n?()=>n(t):void 0},d),u,!E&&a.createElement(F.Z,null)))}const D={menuHtmlItem:"menuHtmlItem_R3Dq"};function R(e){let{item:t,level:n,index:o}=e;const{value:c,defaultStyle:i,className:s}=t;return a.createElement("li",{className:(0,l.Z)(r.k.docs.docSidebarItemLink,r.k.docs.docSidebarItemLinkLevel(n),i&&[D.menuHtmlItem,"menu__list-item"],s),key:o,dangerouslySetInnerHTML:{__html:c}})}function V(e){let{item:t,...n}=e;switch(t.type){case"category":return a.createElement(H,(0,_.Z)({item:t},n));case"html":return a.createElement(R,(0,_.Z)({item:t},n));default:return a.createElement(W,(0,_.Z)({item:t},n))}}function Y(e){let{items:t,...n}=e;return a.createElement(Z.D,null,t.map(((e,t)=>a.createElement(V,(0,_.Z)({key:t,item:e,index:t},n)))))}const U=(0,a.memo)(Y),z={menu:"menu_SCH5",menuWithAnnouncementBar:"menuWithAnnouncementBar_HasS"};function q(e){let{path:t,sidebar:n,className:o}=e;const c=function(){const{isActive:e}=(0,N.nT)(),[t,n]=(0,a.useState)(e);return(0,T.RF)((t=>{let{scrollY:a}=t;e&&n(0===a)}),[e]),e&&t}();return a.createElement("nav",{"aria-label":(0,u.I)({id:"theme.docs.sidebar.navAriaLabel",message:"Docs sidebar",description:"The ARIA label for the sidebar navigation"}),className:(0,l.Z)("menu thin-scrollbar",z.menu,c&&z.menuWithAnnouncementBar,o)},a.createElement("ul",{className:(0,l.Z)(r.k.docs.docSidebarMenu,"menu__list")},a.createElement(U,{items:n,activePath:t,level:1})))}const G="sidebar_YPx9",O="sidebarWithHideableNavbar_EHhG",j="sidebarHidden_uAbk",K="sidebarLogo_ClO6";function Q(e){let{path:t,sidebar:n,onCollapse:o,isHidden:r}=e;const{navbar:{hideOnScroll:c},docs:{sidebar:{hideable:i}}}=(0,k.L)();return a.createElement("div",{className:(0,l.Z)(G,c&&O,r&&j)},c&&a.createElement(v.Z,{tabIndex:-1,className:K}),a.createElement(q,{path:t,sidebar:n}),i&&a.createElement(I,{onClick:o}))}const J=a.memo(Q);var X=n(9723),$=n(5569);const ee=e=>{let{sidebar:t,path:n}=e;const o=(0,$.e)();return a.createElement("ul",{className:(0,l.Z)(r.k.docs.docSidebarMenu,"menu__list")},a.createElement(U,{items:t,activePath:n,onItemClick:e=>{"category"===e.type&&e.href&&o.toggle(),"link"===e.type&&o.toggle()},level:1}))};function te(e){return a.createElement(X.Zo,{component:ee,props:e})}const ne=a.memo(te);function ae(e){const t=(0,g.i)(),n="desktop"===t||"ssr"===t,l="mobile"===t;return a.createElement(a.Fragment,null,n&&a.createElement(J,e),l&&a.createElement(ne,e))}const le={expandButton:"expandButton_SsSu",expandButtonIcon:"expandButtonIcon_voU7"};function oe(e){let{toggleSidebar:t}=e;return a.createElement("div",{className:le.expandButton,title:(0,u.I)({id:"theme.docs.sidebar.expandButtonTitle",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),"aria-label":(0,u.I)({id:"theme.docs.sidebar.expandButtonAriaLabel",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),tabIndex:0,role:"button",onKeyDown:t,onClick:t},a.createElement(C,{className:le.expandButtonIcon}))}const re={docSidebarContainer:"docSidebarContainer_etTB",docSidebarContainerHidden:"docSidebarContainerHidden_VStk",sidebarViewport:"sidebarViewport_Dktc"};function ce(e){let{children:t}=e;const n=(0,d.V)();return a.createElement(a.Fragment,{key:n?.name??"noSidebar"},t)}function ie(e){let{sidebar:t,hiddenSidebarContainer:n,setHiddenSidebarContainer:o}=e;const{pathname:c}=(0,f.TH)(),[i,s]=(0,a.useState)(!1),d=(0,a.useCallback)((()=>{i&&s(!1),!i&&(0,E.n)()&&s(!0),o((e=>!e))}),[o,i]);return a.createElement("aside",{className:(0,l.Z)(r.k.docs.docSidebarContainer,re.docSidebarContainer,n&&re.docSidebarContainerHidden),onTransitionEnd:e=>{e.currentTarget.classList.contains(re.docSidebarContainer)&&n&&s(!0)}},a.createElement(ce,null,a.createElement("div",{className:(0,l.Z)(re.sidebarViewport,i&&re.sidebarViewportHidden)},a.createElement(ae,{sidebar:t,path:c,onCollapse:d,isHidden:i}),i&&a.createElement(oe,{toggleSidebar:d}))))}const se={docMainContainer:"docMainContainer_e0ae",docMainContainerEnhanced:"docMainContainerEnhanced_b8r8",docItemWrapperEnhanced:"docItemWrapperEnhanced_iIit"};function de(e){let{hiddenSidebarContainer:t,children:n}=e;const o=(0,d.V)();return a.createElement("main",{className:(0,l.Z)(se.docMainContainer,(t||!o)&&se.docMainContainerEnhanced)},a.createElement("div",{className:(0,l.Z)("container padding-top--md padding-bottom--lg",se.docItemWrapper,t&&se.docItemWrapperEnhanced)},n))}const me={docPage:"docPage_T49S",docsWrapper:"docsWrapper_EYoY"};function ue(e){let{children:t}=e;const n=(0,d.V)(),[l,o]=(0,a.useState)(!1);return a.createElement(m.Z,{wrapperClassName:me.docsWrapper},a.createElement(h,null),a.createElement("div",{className:me.docPage},n&&a.createElement(ie,{sidebar:n.items,hiddenSidebarContainer:l,setHiddenSidebarContainer:o}),a.createElement(de,{hiddenSidebarContainer:l},t)))}var be=n(5172),pe=n(2793);function he(e){const{versionMetadata:t}=e;return a.createElement(a.Fragment,null,a.createElement(pe.Z,{version:t.version,tag:(0,c.os)(t.pluginId,t.version)}),a.createElement(o.d,null,t.noIndex&&a.createElement("meta",{name:"robots",content:"noindex, nofollow"})))}function Ee(e){const{versionMetadata:t}=e,n=(0,i.hI)(e);if(!n)return a.createElement(be.default,null);const{docElement:c,sidebarName:m,sidebarItems:u}=n;return a.createElement(a.Fragment,null,a.createElement(he,e),a.createElement(o.FG,{className:(0,l.Z)(r.k.wrapper.docsPages,r.k.page.docsDocPage,e.versionMetadata.className)},a.createElement(s.q,{version:t},a.createElement(d.b,{name:m,items:u},a.createElement(ue,null,c)))))}},5172:(e,t,n)=>{n.r(t),n.d(t,{default:()=>c});var a=n(2735),l=n(4094),o=n(421),r=n(7025);function c(){return a.createElement(a.Fragment,null,a.createElement(o.d,{title:(0,l.I)({id:"theme.NotFound.title",message:"Page Not Found"})}),a.createElement(r.Z,null,a.createElement("main",{className:"container margin-vert--xl"},a.createElement("div",{className:"row"},a.createElement("div",{className:"col col--6 col--offset-3"},a.createElement("h1",{className:"hero__title"},a.createElement(l.Z,{id:"theme.NotFound.title",description:"The title of the 404 page"},"Page Not Found")),a.createElement("p",null,a.createElement(l.Z,{id:"theme.NotFound.p1",description:"The first paragraph of the 404 page"},"We could not find what you were looking for.")),a.createElement("p",null,a.createElement(l.Z,{id:"theme.NotFound.p2",description:"The 2nd paragraph of the 404 page"},"Please contact the owner of the site that linked you to the original URL and let them know their link is broken.")))))))}},3603:(e,t,n)=>{n.d(t,{D:()=>c,f:()=>i});var a=n(2735),l=n(2936);const o=Symbol("EmptyContext"),r=a.createContext(o);function c(e){let{children:t}=e;const[n,l]=(0,a.useState)(null),o=(0,a.useMemo)((()=>({expandedItem:n,setExpandedItem:l})),[n]);return a.createElement(r.Provider,{value:o},t)}function i(){const e=(0,a.useContext)(r);if(e===o)throw new l.i6("DocSidebarItemsExpandedStateProvider");return e}},9615:(e,t,n)=>{n.d(t,{a:()=>r});var a=n(2735),l=n(852),o=n(6022);function r(e){let{threshold:t}=e;const[n,r]=(0,a.useState)(!1),c=(0,a.useRef)(!1),{startScroll:i,cancelScroll:s}=(0,l.Ct)();return(0,l.RF)(((e,n)=>{let{scrollY:a}=e;const l=n?.scrollY;l&&(c.current?c.current=!1:a>=l?(s(),r(!1)):a<t?r(!1):a+window.innerHeight<document.documentElement.scrollHeight&&r(!0))})),(0,o.S)((e=>{e.location.hash&&(c.current=!0,r(!1))})),{shown:n,scrollToTop:()=>i(0)}}}}]);