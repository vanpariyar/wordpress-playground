import g from"fs";import y,{basename as W}from"path";import B from"yargs";import F from"express";import{SupportedPHPVersions as z,PHPResponse as E}from"@php-wasm/universal";import{logger as c,errorLogPath as I}from"@php-wasm/logger";import{runBlueprintSteps as x,compileBlueprint as C}from"@wp-playground/blueprints";import{EmscriptenDownloadMonitor as k,ProgressTracker as D}from"@php-wasm/progress";import{loadNodeRuntime as Z,createNodeFsMountHandler as q}from"@php-wasm/node";import{RecommendedPHPVersion as L,zipDirectory as M}from"@wp-playground/common";import{bootWordPress as A}from"@wp-playground/wordpress";import{rootCertificates as O}from"tls";import{createHash as U}from"crypto";import P from"fs-extra";import V from"os";async function j(e){const t=F(),r=await new Promise((a,u)=>{const s=t.listen(e.port,()=>{const d=s.address();d===null||typeof d=="string"?u(new Error("Server address is not available")):a(s)})});t.use("/",async(a,u)=>{const s=await e.handleRequest({url:a.url,headers:_(a),method:a.method,body:await T(a)});u.statusCode=s.httpStatusCode;for(const d in s.headers)u.setHeader(d,s.headers[d]);u.end(s.bytes)});const w=r.address().port;await e.onBind(w)}const T=async e=>await new Promise(t=>{const r=[];e.on("data",p=>{r.push(p)}),e.on("end",()=>{t(Buffer.concat(r))})}),_=e=>{const t={};if(e.rawHeaders&&e.rawHeaders.length)for(let r=0;r<e.rawHeaders.length;r+=2)t[e.rawHeaders[r].toLowerCase()]=e.rawHeaders[r+1];return t};function N(e){return/^latest$|^trunk$|^nightly$|^(?:(\d+)\.(\d+)(?:\.(\d+))?)((?:-beta(?:\d+)?)|(?:-RC(?:\d+)?))?$/.test(e)}const H=y.join(V.homedir(),".wordpress-playground");async function J(e="latest",t){const r=await R(e);return await S(r.url,`${r.version}.zip`,t)}async function Y(e){return await S("https://github.com/WordPress/sqlite-database-integration/archive/refs/heads/main.zip","sqlite.zip",e)}async function S(e,t,r){const p=y.join(H,t);return P.existsSync(p)||(P.ensureDirSync(H),await K(e,p,r)),$(p)}async function K(e,t,r){const w=(await r.monitorFetch(fetch(e))).body.getReader(),a=P.createWriteStream(t);for(;;){const{done:u,value:s}=await w.read();if(s&&a.write(s),u)break}a.close(),a.closed||await new Promise((u,s)=>{a.on("finish",d=>{d?s(d):u(null)})})}function $(e,t){return new File([P.readFileSync(e)],t??W(e))}async function R(e="latest"){if(e.startsWith("https://")||e.startsWith("http://")){const r=U("sha1");r.update(e);const p=r.digest("hex");return{url:e,version:"custom-"+p.substring(0,8)}}if(e==="trunk"||e==="nightly")return{url:"https://wordpress.org/nightly-builds/wordpress-latest.zip",version:"nightly-"+new Date().toISOString().split("T")[0]};let t=await fetch("https://api.wordpress.org/core/version-check/1.7/?channel=beta").then(r=>r.json());t=t.offers.filter(r=>r.response==="autoupdate");for(const r of t){if(e==="beta"&&r.version.includes("beta"))return{url:r.download,version:r.version};if(e==="latest")return{url:r.download,version:r.version};if(r.version.substring(0,e.length)===e)return{url:r.download,version:r.version}}return{url:`https://wordpress.org/wordpress-${e}.zip`,version:e}}async function G(){const e=await B(process.argv.slice(2)).usage("Usage: wp-playground <command> [options]").positional("command",{describe:"Command to run",type:"string",choices:["server","run-blueprint","build-snapshot"]}).option("outfile",{describe:"When building, write to this output file.",type:"string",default:"wordpress.zip"}).option("port",{describe:"Port to listen on when serving.",type:"number",default:9400}).option("php",{describe:"PHP version to use.",type:"string",default:L,choices:z}).option("wp",{describe:"WordPress version to use.",type:"string",default:"latest"}).option("mount",{describe:"Mount a directory to the PHP runtime. You can provide --mount multiple times. Format: /host/path:/vfs/path",type:"array",string:!0}).option("mountBeforeInstall",{describe:"Mount a directory to the PHP runtime before installing WordPress. You can provide --mount-before-install multiple times. Format: /host/path:/vfs/path",type:"array",string:!0}).option("login",{describe:"Should log the user in",type:"boolean",default:!1}).option("blueprint",{describe:"Blueprint to execute.",type:"string"}).option("skipWordPressSetup",{describe:"Do not download, unzip, and install WordPress. Useful for mounting a pre-configured WordPress directory at /wordpress.",type:"boolean",default:!1}).option("quiet",{describe:"Do not output logs and progress messages.",type:"boolean",default:!1}).option("debug",{describe:"Return PHP error log content if an error occurs while building the site.",type:"boolean",default:!1}).showHelpOnFail(!1).check(o=>{if(o.wp!==void 0&&!N(o.wp))try{new URL(o.wp)}catch{throw new Error('Unrecognized WordPress version. Please use "latest", a URL, or a numeric version such as "6.2", "6.0.1", "6.2-beta1", or "6.2-RC1"')}if(o.blueprint!==void 0){const l=y.resolve(process.cwd(),o.blueprint);if(!g.existsSync(l))throw new Error("Blueprint file does not exist");const n=g.readFileSync(l,"utf-8");try{o.blueprint=JSON.parse(n)}catch{throw new Error("Blueprint file is not a valid JSON file")}}return!0});e.wrap(e.terminalWidth());const t=await e.argv;t.quiet&&(c.handlers=[]);async function r(o){const{php:l,reap:n}=await s.processManager.acquirePHPInstance();try{await l.run({code:`<?php
				$zip = new ZipArchive();
				if(false === $zip->open('/tmp/build.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
					throw new Exception('Failed to create ZIP');
				}
				$files = new RecursiveIteratorIterator(
					new RecursiveDirectoryIterator('/wordpress')
				);
				foreach ($files as $file) {
					echo $file . PHP_EOL;
					if (!$file->isFile()) {
						continue;
					}
					$zip->addFile($file->getPathname(), $file->getPathname());
				}
				$zip->close();

			`});const i=l.readFileAsBuffer("/tmp/build.zip");g.writeFileSync(o,i)}finally{n()}}function p(o,l){const n=l.map(i=>{const[f,b]=i.split(":");return{hostPath:y.resolve(process.cwd(),f),vfsPath:b}});for(const i of n)o.mkdir(i.vfsPath),o.mount(i.vfsPath,q(i.hostPath))}function w(){let o;t.blueprint?o=t.blueprint:o={preferredVersions:{php:t.php,wp:t.wp},login:t.login};const l=new D;let n="",i=!1;return l.addEventListener("progress",f=>{i||(f.detail.progress===100&&(i=!0),n=f.detail.caption||n||"Running the Blueprint",c.log(`\r\x1B[K${n.trim()} – ${f.detail.progress}%`),i&&c.log(`
`))}),C(o,{progress:l})}const a=t._[0];["run-blueprint","server","build-snapshot"].includes(a)||(e.showHelp(),process.exit(1));const u=w();let s,d=!1;c.log("Starting a PHP server..."),j({port:t.port,onBind:async o=>{const l=`http://127.0.0.1:${o}`;c.log(`Setting up WordPress ${t.wp}`);let n;const i=new k;t.skipWordPressSetup||(i.addEventListener("progress",h=>{const m=Math.round(Math.min(100,100*h.detail.loaded/h.detail.total));t.quiet||c.log(`\rDownloading WordPress ${m}%...    `)}),n=await R(t.wp));const f=n&&y.join(H,`prebuilt-wp-content-for-wp-${n.version}.zip`),b=n?g.existsSync(f)?$(f):J(n.url,i):void 0;s=await A({siteUrl:l,createPhpRuntime:async()=>await Z(u.versions.php),wordPressZip:b,sqliteIntegrationPluginZip:Y(i),sapiName:"cli",createFiles:{"/internal/shared/ca-bundle.crt":O.join(`
`)},phpIniEntries:{"openssl.cafile":"/internal/shared/ca-bundle.crt",allow_url_fopen:"1",disable_functions:""},hooks:{async beforeWordPressFiles(h){t.mountBeforeInstall&&p(h,t.mountBeforeInstall)}}});const v=await s.getPrimaryPhp();try{if(n&&!t.mountBeforeInstall&&g.writeFileSync(f,await M(v,"/wordpress")),t.mount&&p(v,t.mount),d=!0,u){const{php:h,reap:m}=await s.processManager.acquirePHPInstance();try{c.log("Running the Blueprint..."),await x(u,h),c.log("Finished running the blueprint")}finally{m()}}a==="build-snapshot"?(await r(t.outfile),c.log(`WordPress exported to ${t.outfile}`),process.exit(0)):a==="run-blueprint"?(c.log("Blueprint executed"),process.exit(0)):c.log(`WordPress is running on ${l}`)}catch(h){if(!t.debug)throw h;const m=v.readFileAsText(I);throw new Error(m,{cause:h})}},async handleRequest(o){return d?await s.request(o):E.forHttpCode(502,"WordPress is not ready yet")}})}G();
