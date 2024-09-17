import{joinPaths as a,phpVar as d}from"@php-wasm/util";import{unzipFile as l}from"@wp-playground/common";import{PHPRequestHandler as f,withPHPIniValues as g,PHP as w,setPhpIniEntries as _,writeFiles as m,proxyFileSystem as h,rotatePHPRuntime as $}from"@php-wasm/universal";async function k(e){async function r(n,o){const s=new w(await e.createPhpRuntime());return e.sapiName&&s.setSapiName(e.sapiName),n&&(s.requestHandler=n),e.phpIniEntries&&_(s,e.phpIniEntries),o?(await L(s),await m(s,"/",e.createFiles||{}),await S(s,a(new URL(e.siteUrl).pathname,"phpinfo.php"))):h(await n.getPrimaryPhp(),s,["/tmp",n.documentRoot,"/internal/shared"]),e.spawnHandler&&await s.setSpawnHandler(e.spawnHandler(n.processManager)),$({php:s,cwd:n.documentRoot,recreateRuntime:e.createPhpRuntime,maxRequests:400}),s}const t=new f({phpFactory:async({isPrimary:n})=>r(t,n),documentRoot:e.documentRoot||"/wordpress",absoluteUrl:e.siteUrl,rewriteRules:E,getFileNotFoundAction:e.getFileNotFoundAction??b}),i=await t.getPrimaryPhp();if(e.hooks?.beforeWordPressFiles&&await e.hooks.beforeWordPressFiles(i),e.wordPressZip&&await F(i,await e.wordPressZip),e.constants)for(const n in e.constants)i.defineConstant(n,e.constants[n]);if(i.defineConstant("WP_HOME",e.siteUrl),i.defineConstant("WP_SITEURL",e.siteUrl),e.hooks?.beforeDatabaseSetup&&await e.hooks.beforeDatabaseSetup(i),e.sqliteIntegrationPluginZip&&await R(i,await e.sqliteIntegrationPluginZip),await c(i)||await P(i),!await c(i))throw new Error("WordPress installation has failed.");return t}async function c(e){return(await e.run({code:`<?php
$wp_load = getenv('DOCUMENT_ROOT') . '/wp-load.php';
if (!file_exists($wp_load)) {
	echo '0';
	exit;
}
require $wp_load;
echo is_blog_installed() ? '1' : '0';
`,env:{DOCUMENT_ROOT:e.documentRoot}})).text==="1"}async function P(e){await g(e,{disable_functions:"fsockopen",allow_url_fopen:"0"},async()=>await e.request({url:"/wp-admin/install.php?step=2",method:"POST",body:{language:"en",prefix:"wp_",weblog_title:"My WordPress Website",user_name:"admin",admin_password:"password",admin_password2:"password",Submit:"Install WordPress",pw_weak:"1",admin_email:"admin@localhost.com"}}))}function b(e){return{type:"internal-redirect",uri:"/index.php"}}async function q(e){const i=(await(await e.getPrimaryPhp()).run({code:`<?php
			require '${e.documentRoot}/wp-includes/version.php';
			echo $wp_version;
		`})).text;if(!i)throw new Error("Unable to read loaded WordPress version.");return y(i)}function y(e){if(/-(alpha|beta|RC)\d*-\d+$/.test(e))return"nightly";if(/-(beta|RC)\d*$/.test(e))return"beta";const i=e.match(/^(\d+\.\d+)(?:\.\d+)?$/);return i!==null?i[1]:e}const E=[{match:/^\/(.*?)(\/wp-(content|admin|includes)\/.*)/g,replacement:"$2"}];async function L(e){await e.mkdir("/internal/shared/mu-plugins"),await e.writeFile("/internal/shared/preload/env.php",`<?php

        // Allow adding filters/actions prior to loading WordPress.
        // $function_to_add MUST be a string.
        function playground_add_filter( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
            global $wp_filter;
            $wp_filter[$tag][$priority][$function_to_add] = array('function' => $function_to_add, 'accepted_args' => $accepted_args);
        }
        function playground_add_action( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
            playground_add_filter( $tag, $function_to_add, $priority, $accepted_args );
        }

        // Load our mu-plugins after customer mu-plugins
        // NOTE: this means our mu-plugins can't use the muplugins_loaded action!
        playground_add_action( 'muplugins_loaded', 'playground_load_mu_plugins', 0 );
        function playground_load_mu_plugins() {
            // Load all PHP files from /internal/shared/mu-plugins, sorted by filename
            $mu_plugins_dir = '/internal/shared/mu-plugins';
            if(!is_dir($mu_plugins_dir)){
                return;
            }
            $mu_plugins = glob( $mu_plugins_dir . '/*.php' );
            sort( $mu_plugins );
            foreach ( $mu_plugins as $mu_plugin ) {
                require_once $mu_plugin;
            }
        }
    `),await e.writeFile("/internal/shared/mu-plugins/0-playground.php",`<?php
        // Needed because gethostbyname( 'wordpress.org' ) returns
        // a private network IP address for some reason.
        add_filter( 'allowed_redirect_hosts', function( $deprecated = '' ) {
            return array(
                'wordpress.org',
                'api.wordpress.org',
                'downloads.wordpress.org',
            );
        } );

		// Support pretty permalinks
        add_filter( 'got_url_rewrite', '__return_true' );

        // Create the fonts directory if missing
        if(!file_exists(WP_CONTENT_DIR . '/fonts')) {
            mkdir(WP_CONTENT_DIR . '/fonts');
        }

        $log_file = WP_CONTENT_DIR . '/debug.log';
        define('ERROR_LOG_FILE', $log_file);
        ini_set('error_log', $log_file);
        ?>`),await e.writeFile("/internal/shared/preload/error-handler.php",`<?php
		(function() {
			$playground_consts = [];
			if(file_exists('/internal/shared/consts.json')) {
				$playground_consts = @json_decode(file_get_contents('/internal/shared/consts.json'), true) ?: [];
				$playground_consts = array_keys($playground_consts);
			}
			set_error_handler(function($severity, $message, $file, $line) use($playground_consts) {
				/**
				 * We're forced to use this deprecated hook to ensure SSL operations work without
				 * the kitchen-sink bundled. See https://github.com/WordPress/wordpress-playground/pull/1504
				 * for more context.
				 */
				if (
					strpos($message, "Hook http_api_transports is deprecated") !== false ||
					strpos($message, "Hook http_api_transports is <strong>deprecated</strong>") !== false
				) {
					return;
				}
				/**
				 * This is a temporary workaround to hide the 32bit integer warnings that
				 * appear when using various time related function, such as strtotime and mktime.
				 * Examples of the warnings that are displayed:
				 *
				 * Warning: mktime(): Epoch doesn't fit in a PHP integer in <file>
				 * Warning: strtotime(): Epoch doesn't fit in a PHP integer in <file>
				 */
				if (strpos($message, "fit in a PHP integer") !== false) {
					return;
				}
				/**
				 * Playground defines some constants upfront, and some of them may be redefined
				 * in wp-config.php. For example, SITE_URL or WP_DEBUG. This is expected and
				 * we want Playground constants to take priority without showing warnings like:
				 *
				 * Warning: Constant SITE_URL already defined in
				 */
				if (strpos($message, "already defined") !== false) {
					foreach($playground_consts as $const) {
						if(strpos($message, "Constant $const already defined") !== false) {
							return;
						}
					}
				}
				/**
				 * Don't complain about network errors when not connected to the network.
				 */
				if (
					(
						! defined('USE_FETCH_FOR_REQUESTS') ||
						! USE_FETCH_FOR_REQUESTS
					) &&
					strpos($message, "WordPress could not establish a secure connection to WordPress.org") !== false)
				{
					return;
				}
				return false;
			});
		})();`)}async function S(e,r="/phpinfo.php"){await e.writeFile("/internal/shared/preload/phpinfo.php",`<?php
    // Render PHPInfo if the requested page is /phpinfo.php
    if ( ${d(r)} === $_SERVER['REQUEST_URI'] ) {
        phpinfo();
        exit;
    }
    `)}async function R(e,r){await e.isDir("/tmp/sqlite-database-integration")&&await e.rmdir("/tmp/sqlite-database-integration",{recursive:!0}),await e.mkdir("/tmp/sqlite-database-integration"),await l(e,r,"/tmp/sqlite-database-integration");const t="/internal/shared/sqlite-database-integration",i=await e.isDir("/tmp/sqlite-database-integration/sqlite-database-integration-main")?"/tmp/sqlite-database-integration/sqlite-database-integration-main":"/tmp/sqlite-database-integration/sqlite-database-integration-develop";await e.mv(i,t),await e.defineConstant("SQLITE_MAIN_FILE","1");const o=(await e.readFileAsText(a(t,"db.copy"))).replace("'{SQLITE_IMPLEMENTATION_FOLDER_PATH}'",d(t)).replace("'{SQLITE_PLUGIN}'",d(a(t,"load.php"))),s=a(await e.documentRoot,"wp-content/db.php"),p=`<?php
	// Do not preload this if WordPress comes with a custom db.php file.
	if(file_exists(${d(s)})) {
		return;
	}
	?>`,u="/internal/shared/mu-plugins/sqlite-database-integration.php";await e.writeFile(u,p+o),await e.writeFile("/internal/shared/preload/0-sqlite.php",p+`<?php

/**
 * Loads the SQLite integration plugin before WordPress is loaded
 * and without creating a drop-in "db.php" file.
 *
 * Technically, it creates a global $wpdb object whose only two
 * purposes are to:
 *
 * * Exist – because the require_wp_db() WordPress function won't
 *           connect to MySQL if $wpdb is already set.
 * * Load the SQLite integration plugin the first time it's used
 *   and replace the global $wpdb reference with the SQLite one.
 *
 * This lets Playground keep the WordPress installation clean and
 * solves dillemas like:
 *
 * * Should we include db.php in Playground exports?
 * * Should we remove db.php from Playground imports?
 * * How should we treat stale db.php from long-lived OPFS sites?
 *
 * @see https://github.com/WordPress/wordpress-playground/discussions/1379 for
 *      more context.
 */
class Playground_SQLite_Integration_Loader {
	public function __call($name, $arguments) {
		$this->load_sqlite_integration();
		if($GLOBALS['wpdb'] === $this) {
			throw new Exception('Infinite loop detected in $wpdb – SQLite integration plugin could not be loaded');
		}
		return call_user_func_array(
			array($GLOBALS['wpdb'], $name),
			$arguments
		);
	}
	public function __get($name) {
		$this->load_sqlite_integration();
		if($GLOBALS['wpdb'] === $this) {
			throw new Exception('Infinite loop detected in $wpdb – SQLite integration plugin could not be loaded');
		}
		return $GLOBALS['wpdb']->$name;
	}
	public function __set($name, $value) {
		$this->load_sqlite_integration();
		if($GLOBALS['wpdb'] === $this) {
			throw new Exception('Infinite loop detected in $wpdb – SQLite integration plugin could not be loaded');
		}
		$GLOBALS['wpdb']->$name = $value;
	}
    protected function load_sqlite_integration() {
        require_once ${d(u)};
    }
}
$wpdb = $GLOBALS['wpdb'] = new Playground_SQLite_Integration_Loader();

/**
 * WordPress is capable of using a preloaded global $wpdb. However, if
 * it cannot find the drop-in db.php plugin it still checks whether
 * the mysqli_connect() function exists even though it's not used.
 *
 * What WordPress demands, Playground shall provide.
 */
if(!function_exists('mysqli_connect')) {
	function mysqli_connect() {}
}

		`),await e.writeFile("/internal/shared/mu-plugins/sqlite-test.php",`<?php
		global $wpdb;
		if(!($wpdb instanceof WP_SQLite_DB)) {
			var_dump(isset($wpdb));
			die("SQLite integration not loaded " . get_class($wpdb));
		}
		`)}async function F(e,r){e.mkdir("/tmp/unzipped-wordpress"),await l(e,r,"/tmp/unzipped-wordpress"),e.fileExists("/tmp/unzipped-wordpress/wordpress.zip")&&await l(e,"/tmp/unzipped-wordpress/wordpress.zip","/tmp/unzipped-wordpress");let t=e.fileExists("/tmp/unzipped-wordpress/wordpress")?"/tmp/unzipped-wordpress/wordpress":e.fileExists("/tmp/unzipped-wordpress/build")?"/tmp/unzipped-wordpress/build":"/tmp/unzipped-wordpress";if(!e.fileExists(a(t,"wp-config-sample.php"))){const i=e.listFiles(t);if(i.length){const n=i[0];e.fileExists(a(t,n,"wp-config-sample.php"))&&(t=a(t,n))}}if(e.isDir(e.documentRoot)&&I(e.documentRoot,e)){for(const i of e.listFiles(t)){const n=a(t,i),o=a(e.documentRoot,i);e.mv(n,o)}e.rmdir(t,{recursive:!0})}else e.mv(t,e.documentRoot);!e.fileExists(a(e.documentRoot,"wp-config.php"))&&e.fileExists(a(e.documentRoot,"wp-config-sample.php"))&&e.writeFile(a(e.documentRoot,"wp-config.php"),e.readFileAsText(a(e.documentRoot,"/wp-config-sample.php")))}function I(e,r){const t=r.listFiles(e);return t.length===0||t.length===1&&t[0]==="playground-site-metadata.json"}export{k as bootWordPress,b as getFileNotFoundActionForWordPress,q as getLoadedWordPressVersion,S as preloadPhpInfoRoute,R as preloadSqliteIntegration,L as setupPlatformLevelMuPlugins,F as unzipWordPress,y as versionStringToLoadedWordPressVersion,E as wordPressRewriteRules};
