import "@php-wasm/node-polyfills";
import { phpVar as se, randomFilename as Pr, phpVars as Je, joinPaths as oe, dirname as _r, randomString as kr, Semaphore as Or } from "@php-wasm/util";
import { logger as me } from "@php-wasm/logger";
import { isURLScoped as $r, getURLScope as Er } from "@php-wasm/scopes";
import { unzipFile as ar } from "@wp-playground/common";
import { cloneResponseMonitorProgress as Tr, ProgressTracker as jr } from "@php-wasm/progress";
import { SupportedPHPExtensionsList as qr, SupportedPHPExtensionBundles as sr, LatestSupportedPHPVersion as Ar, SupportedPHPVersions as Rr } from "@php-wasm/universal";
const pr = [
  "db.php",
  "plugins/akismet",
  "plugins/hello.php",
  "plugins/wordpress-importer",
  "mu-plugins/sqlite-database-integration",
  "mu-plugins/playground-includes",
  "mu-plugins/0-playground.php",
  "mu-plugins/0-sqlite.php",
  /*
   * Listing core themes like that here isn't ideal, especially since
   * developers may actually want to use one of them.
   * @TODO Let's give the user a choice whether or not to include them.
   */
  "themes/twentytwenty",
  "themes/twentytwentyone",
  "themes/twentytwentytwo",
  "themes/twentytwentythree",
  "themes/twentytwentyfour",
  "themes/twentytwentyfive",
  "themes/twentytwentysix"
], Ke = async (r, { pluginPath: t, pluginName: f }, c) => {
  c == null || c.tracker.setCaption(`Activating ${f || t}`);
  const u = await r.documentRoot, i = await r.run({
    code: `<?php
			define( 'WP_ADMIN', true );
			require_once( ${se(u)}. "/wp-load.php" );
			require_once( ${se(u)}. "/wp-admin/includes/plugin.php" );

			// Set current user to admin
			wp_set_current_user( get_users(array('role' => 'Administrator') )[0]->ID );

			$plugin_path = ${se(t)};
			$response = false;
			if (!is_dir($plugin_path)) {
				$response = activate_plugin($plugin_path);
			}

			// Activate plugin by name if activation by path wasn't successful
			if ( null !== $response ) {
				foreach ( ( glob( $plugin_path . '/*.php' ) ?: array() ) as $file ) {
					$info = get_plugin_data( $file, false, false );
					if ( ! empty( $info['Name'] ) ) {
						$response = activate_plugin( $file );
						break;
					}
				}
			}

			if ( null === $response ) {
				die('Plugin activated successfully');
			} else if ( is_wp_error( $response ) ) {
				throw new Exception( $response->get_error_message() );
			}

			throw new Exception( 'Unable to activate plugin' );
		`
  });
  if (i.text !== "Plugin activated successfully")
    throw me.debug(i), new Error(
      `Plugin ${t} could not be activated – WordPress exited with no error. Sometimes, when $_SERVER or site options are not configured correctly, WordPress exits early with a 301 redirect. Inspect the "debug" logs in the console for more details`
    );
}, fr = async (r, { themeFolderName: t }, f) => {
  f == null || f.tracker.setCaption(`Activating ${t}`);
  const c = await r.documentRoot, u = `${c}/wp-content/themes/${t}`;
  if (!await r.fileExists(u))
    throw new Error(`
			Couldn't activate theme ${t}.
			Theme not found at the provided theme path: ${u}.
			Check the theme path to ensure it's correct.
			If the theme is not installed, you can install it using the installTheme step.
			More info can be found in the Blueprint documentation: https://wordpress.github.io/wordpress-playground/blueprints/steps/#ActivateThemeStep
		`);
  const i = await r.run({
    code: `<?php
			define( 'WP_ADMIN', true );
			require_once( getenv('docroot') . "/wp-load.php" );

			// Set current user to admin
			wp_set_current_user( get_users(array('role' => 'Administrator') )[0]->ID );

			switch_theme( getenv('themeFolderName') );

			if( wp_get_theme()->get_stylesheet() !== getenv('themeFolderName') ) {
				throw new Exception( 'Theme ' . getenv('themeFolderName') . ' could not be activated.' );				
			}
			die('Theme activated successfully');
		`,
    env: {
      docroot: c,
      themeFolderName: t
    }
  });
  if (i.text !== "Theme activated successfully")
    throw me.debug(i), new Error(
      `Theme ${t} could not be activated – WordPress exited with no error. Sometimes, when $_SERVER or site options are not configured correctly, WordPress exits early with a 301 redirect. Inspect the "debug" logs in the console for more details`
    );
}, Lr = async (r, { code: t }) => await r.run({ code: t }), Sr = async (r, { options: t }) => await r.run(t), lr = async (r, { path: t }) => {
  await r.unlink(t);
}, Nr = async (r, { sql: t }, f) => {
  f == null || f.tracker.setCaption("Executing SQL Queries");
  const c = `/tmp/${Pr()}.sql`;
  await r.writeFile(
    c,
    new Uint8Array(await t.arrayBuffer())
  );
  const u = await r.documentRoot, i = Je({ docroot: u, sqlFilename: c }), e = await r.run({
    code: `<?php
		require_once ${i.docroot} . '/wp-load.php';

		$handle = fopen(${i.sqlFilename}, 'r');
		$buffer = '';

		global $wpdb;

		while ($bytes = fgets($handle)) {
			$buffer .= $bytes;

			if (!feof($handle) && substr($buffer, -1, 1) !== "
") {
				continue;
			}

			$wpdb->query($buffer);
			$buffer = '';
		}
	`
  });
  return await lr(r, { path: c }), e;
}, Qe = async (r, { request: t }) => {
  me.warn(
    'Deprecated: The Blueprint step "request" is deprecated and will be removed in a future release.'
  );
  const f = await r.request(t);
  if (f.httpStatusCode > 399 || f.httpStatusCode < 200)
    throw me.warn("WordPress response was", { response: f }), new Error(
      `Request failed with status ${f.httpStatusCode}`
    );
  return f;
}, Fr = `<?php

/**
 * Rewrites the wp-config.php file to ensure specific constants are defined
 * with specific values.
 * 
 * Example:
 * 
 * \`\`\`php
 * <?php
 * define('WP_DEBUG', true);
 * // The third define() argument is also supported:
 * define('SAVEQUERIES', false, true);
 * 
 * // Expression
 * define(true ? 'WP_DEBUG_LOG' : 'WP_DEBUG_LOG', 123);
 * 
 * // Guarded expressions shouldn't be wrapped twice
 * if(!defined(1 ? 'A' : 'B')) {
 *     define(1 ? 'A' : 'B', 0);
 * }
 * 
 * // More advanced expression
 * define((function() use($x) {
 *     return [$x, 'a'];
 * })(), 123);
 * \`\`\`
 * 
 * Rewritten with
 * 
 *     $constants = [
 *        'WP_DEBUG' => false,
 *        'WP_DEBUG_LOG' => true,
 *        'SAVEQUERIES' => true,
 *        'NEW_CONSTANT' => "new constant",
 *     ];
 * 
 * \`\`\`php
 * <?php
 * define('WP_DEBUG_LOG',true);
 * define('NEW_CONSTANT','new constant');
 * ?><?php
 * define('WP_DEBUG',false);
 * // The third define() argument is also supported:
 * define('SAVEQUERIES',true, true);
 * 
 * // Expression
 * if(!defined($const ? 'WP_DEBUG_LOG' : 'WP_DEBUG_LOG')) {
 *      define($const ? 'WP_DEBUG_LOG' : 'WP_DEBUG_LOG', 123);
 * }
 * 
 * // Guarded expressions shouldn't be wrapped twice
 * if(!defined(1 ? 'A' : 'B')) {
 *     define(1 ? 'A' : 'B', 0);
 * }
 * 
 * // More advanced expression
 * if(!defined((function() use($x) {
 *    return [$x, 'a'];
 * })())) {
 *     define((function() use($x) {
 *         return [$x, 'a'];
 *     })(), 123);
 * }
 * \`\`\`
 * 
 * @param mixed $content
 * @return string
 */
function rewrite_wp_config_to_define_constants($content, $constants = [])
{
    $tokens = array_reverse(token_get_all($content));
    $output = [];
    $defined_expressions = [];

    // Look through all the tokens and find the define calls
    do {
        $buffer = [];
        $name_buffer = [];
        $value_buffer = [];
        $third_arg_buffer = [];

        // Capture everything until the define call into output.
        // Capturing the define call into a buffer.
        // Example:
        //     <?php echo 'a'; define  (
        //     ^^^^^^^^^^^^^^^^^^^^^^
        //           output   |buffer
        while ($token = array_pop($tokens)) {
            if (is_array($token) && $token[0] === T_STRING && (strtolower($token[1]) === 'define' || strtolower($token[1]) === 'defined')) {
                $buffer[] = $token;
                break;
            }
            $output[] = $token;
        }

        // Maybe we didn't find a define call and reached the end of the file?
        if (!count($tokens)) {
            break;
        }

        // Keep track of the "defined" expressions that are already accounted for
        if($token[1] === 'defined') {
            $output[] = $token;
            $defined_expression = [];
            $open_parenthesis = 0;
            // Capture everything up to the opening parenthesis, including the parenthesis
            // e.g. defined  (
            //           ^^^^
            while ($token = array_pop($tokens)) {
                $output[] = $token;
                if ($token === "(") {
                    ++$open_parenthesis;
                    break;
                }
            }

            // Capture everything up to the closing parenthesis, including the parenthesis
            // e.g. defined  (
            //           ^^^^
            while ($token = array_pop($tokens)) {
                $output[] = $token;
                if ($token === ")") {
                    --$open_parenthesis;
                }
                if ($open_parenthesis === 0) {
                    break;
                }
                $defined_expression[] = $token;
            }

            $defined_expressions[] = stringify_tokens(skip_whitespace($defined_expression));
            continue;
        }

        // Capture everything up to the opening parenthesis, including the parenthesis
        // e.g. define  (
        //           ^^^^
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === "(") {
                break;
            }
        }

        // Capture the first argument – it's the first expression after the opening
        // parenthesis and before the comma:
        // Examples:
        //     define("WP_DEBUG", true);
        //            ^^^^^^^^^^^
        //
        //     define(count([1,2]) > 2 ? 'WP_DEBUG' : 'FOO', true);
        //            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        $open_parenthesis = 0;
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === "(" || $token === "[" || $token === "{") {
                ++$open_parenthesis;
            } elseif ($token === ")" || $token === "]" || $token === "}") {
                --$open_parenthesis;
            } elseif ($token === "," && $open_parenthesis === 0) {
                break;
            }

            // Don't capture the comma as a part of the constant name
            $name_buffer[] = $token;
        }

        // Capture everything until the closing parenthesis
        //     define("WP_DEBUG", true);
        //                       ^^^^^^
        $open_parenthesis = 0;
        $is_second_argument = true;
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === ")" && $open_parenthesis === 0) {
                // Final parenthesis of the define call.
                break;
            } else if ($token === "(" || $token === "[" || $token === "{") {
                ++$open_parenthesis;
            } elseif ($token === ")" || $token === "]" || $token === "}") {
                --$open_parenthesis;
            } elseif ($token === "," && $open_parenthesis === 0) {
                // This define call has more than 2 arguments! The third one is the
                // boolean value indicating $is_case_insensitive. Let's continue capturing
                // to $third_arg_buffer.
                $is_second_argument = false;
            }
            if ($is_second_argument) {
                $value_buffer[] = $token;
            } else {
                $third_arg_buffer[] = $token;
            }
        }

        // Capture until the semicolon
        //     define("WP_DEBUG", true)  ;
        //                             ^^^
        while ($token = array_pop($tokens)) {
            $buffer[] = $token;
            if ($token === ";") {
                break;
            }
        }

        // Decide whether $name_buffer is a constant name or an expression
        $name_token = null;
        $name_token_index = $token;
        $name_is_literal = true;
        foreach ($name_buffer as $k => $token) {
            if (is_array($token)) {
                if ($token[0] === T_WHITESPACE || $token[0] === T_COMMENT || $token[0] === T_DOC_COMMENT) {
                    continue;
                } else if ($token[0] === T_STRING || $token[0] === T_CONSTANT_ENCAPSED_STRING) {
                    $name_token = $token;
                    $name_token_index = $k;
                } else {
                    $name_is_literal = false;
                    break;
                }
            } else if ($token !== "(" && $token !== ")") {
                $name_is_literal = false;
                break;
            }
        }

        // We can't handle expressions as constant names. Let's wrap that define
        // call in an if(!defined()) statement, just in case it collides with
        // a constant name.
        if (!$name_is_literal) {
            // Ensure the defined expression is not already accounted for
            foreach ($defined_expressions as $defined_expression) {
                if ($defined_expression === stringify_tokens(skip_whitespace($name_buffer))) {
                    $output = array_merge($output, $buffer);
                    continue 2;
                }
            }
            $output = array_merge(
                $output,
                ["if(!defined("],
                $name_buffer,
                [")) {\\n     "],
                ['define('],
                $name_buffer,
                [','],
                $value_buffer,
                $third_arg_buffer,
                [");"],
                ["\\n}\\n"]
            );
            continue;
        }

        // Yay, we have a literal constant name in the buffer now. Let's
        // get its value:
        $name = eval('return ' . $name_token[1] . ';');

        // If the constant name is not in the list of constants we're looking,
        // we can ignore it.
        if (!array_key_exists($name, $constants)) {
            $output = array_merge($output, $buffer);
            continue;
        }

        // We now have a define() call that defines a constant we're looking for.
        // Let's rewrite its value to the one 
        $output = array_merge(
            $output,
            ['define('],
            $name_buffer,
            [','],
            [var_export($constants[$name], true)],
            $third_arg_buffer,
            [");"]
        );

        // Remove the constant from the list so we can process any remaining
        // constants later.
        unset($constants[$name]);
    } while (count($tokens));

    // Add any constants that weren't found in the file
    if (count($constants)) {
        $prepend = [
            "<?php \\n"
        ];
        foreach ($constants as $name => $value) {
            $prepend = array_merge(
                $prepend,
                [
                    "define(",
                    var_export($name, true),
                    ',',
                    var_export($value, true),
                    ");\\n"
                ]
            );
        }
        $prepend[] = "?>";
        $output = array_merge(
            $prepend,
            $output
        );
    }

    // Translate the output tokens back into a string
    return stringify_tokens($output);
}

function stringify_tokens($tokens) {
    $output = '';
    foreach ($tokens as $token) {
        if (is_array($token)) {
            $output .= $token[1];
        } else {
            $output .= $token;
        }
    }
    return $output;
}

function skip_whitespace($tokens) {
    $output = [];
    foreach ($tokens as $token) {
        if (is_array($token) && ($token[0] === T_WHITESPACE || $token[0] === T_COMMENT || $token[0] === T_DOC_COMMENT)) {
            continue;
        }
        $output[] = $token;
    }
    return $output;
}
`, Ve = async (r, { consts: t, method: f = "define-before-run" }) => {
  switch (f) {
    case "define-before-run":
      await xr(r, t);
      break;
    case "rewrite-wp-config": {
      const c = await r.documentRoot, u = oe(c, "/wp-config.php"), i = await r.readFileAsText(u), e = await Cr(
        r,
        i,
        t
      );
      await r.writeFile(u, e);
      break;
    }
    default:
      throw new Error(`Invalid method: ${f}`);
  }
};
async function xr(r, t) {
  for (const f in t)
    await r.defineConstant(f, t[f]);
}
async function Cr(r, t, f) {
  await r.writeFile("/tmp/code.php", t);
  const c = Je({
    consts: f
  });
  return await r.run({
    code: `${Fr}
	$wp_config_path = '/tmp/code.php';
	$wp_config = file_get_contents($wp_config_path);
	$new_wp_config = rewrite_wp_config_to_define_constants($wp_config, ${c.consts});
	file_put_contents($wp_config_path, $new_wp_config);
	`
  }), await r.readFileAsText("/tmp/code.php");
}
const Xe = async (r, { username: t = "admin", password: f = "password" } = {}, c) => {
  var i, e, d;
  c == null || c.tracker.setCaption((c == null ? void 0 : c.initialCaption) || "Logging in"), await r.request({
    url: "/wp-login.php"
  });
  const u = await r.request({
    url: "/wp-login.php",
    method: "POST",
    body: {
      log: t,
      pwd: f,
      rememberme: "forever"
    }
  });
  if (!((d = (e = (i = u.headers) == null ? void 0 : i.location) == null ? void 0 : e[0]) != null && d.includes("/wp-admin/")))
    throw me.warn("WordPress response was", {
      response: u,
      text: u.text
    }), new Error(
      `Failed to log in as ${t} with password ${f}`
    );
}, dr = async (r, { options: t }) => {
  const f = await r.documentRoot;
  await r.run({
    code: `<?php
		include ${se(f)} . '/wp-load.php';
		$site_options = ${se(t)};
		foreach($site_options as $name => $value) {
			update_option($name, $value);
		}
		echo "Success";
		`
  });
}, Ir = async (r, { meta: t, userId: f }) => {
  const c = await r.documentRoot;
  await r.run({
    code: `<?php
		include ${se(c)} . '/wp-load.php';
		$meta = ${se(t)};
		foreach($meta as $name => $value) {
			update_user_meta(${se(f)}, $name, $value);
		}
		`
  });
}, Ur = async (r) => {
  var R;
  await Ve(r, {
    consts: {
      WP_ALLOW_MULTISITE: 1
    }
  });
  const t = new URL(await r.absoluteUrl);
  if (t.port !== "") {
    let M = `The current host is ${t.host}, but WordPress multisites do not support custom ports.`;
    throw t.hostname === "localhost" && (M += " For development, you can set up a playground.test domain using the instructions at https://wordpress.github.io/wordpress-playground/contributing/code."), new Error(M);
  }
  const f = t.pathname.replace(/\/$/, "") + "/", c = `${t.protocol}//${t.hostname}${f}`;
  await dr(r, {
    options: {
      siteurl: c,
      home: c
    }
  }), await Xe(r, {});
  const u = await r.documentRoot, e = (await r.run({
    code: `<?php
define( 'WP_ADMIN', true );
require_once(${se(u)} . "/wp-load.php");

// Set current user to admin
( get_users(array('role' => 'Administrator') )[0] );

require_once(${se(u)} . "/wp-admin/includes/plugin.php");
$plugins_root = ${se(u)} . "/wp-content/plugins";
$plugins = glob($plugins_root . "/*");

$deactivated_plugins = [];
foreach($plugins as $plugin_path) {
	if (str_ends_with($plugin_path, '/index.php')) {
		continue;
	}
	if (!is_dir($plugin_path)) {
		$deactivated_plugins[] = substr($plugin_path, strlen($plugins_root) + 1);
		deactivate_plugins($plugin_path);
		continue;
	}
	// Find plugin entry file
	foreach ( ( glob( $plugin_path . '/*.php' ) ?: array() ) as $file ) {
		$info = get_plugin_data( $file, false, false );
		if ( ! empty( $info['Name'] ) ) {
			deactivate_plugins( $file );
			$deactivated_plugins[] = substr($file, strlen($plugins_root) + 1);
			break;
		}
	}
}
echo json_encode($deactivated_plugins);
`
  })).json, O = (R = (await Qe(r, {
    request: {
      url: "/wp-admin/network.php"
    }
  })).text.match(
    /name="_wpnonce"\s+value="([^"]+)"/
  )) == null ? void 0 : R[1], B = await Qe(r, {
    request: {
      url: "/wp-admin/network.php",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: Wr({
        _wpnonce: O,
        _wp_http_referer: f + "wp-admin/network.php",
        sitename: "My WordPress Website Sites",
        email: "admin@localhost.com",
        submit: "Install"
      })
    }
  });
  if (B.httpStatusCode !== 200)
    throw me.warn("WordPress response was", {
      response: B,
      text: B.text,
      headers: B.headers
    }), new Error(
      `Failed to enable multisite. Response code was ${B.httpStatusCode}`
    );
  await Ve(r, {
    consts: {
      MULTISITE: !0,
      SUBDOMAIN_INSTALL: !1,
      SITE_ID_CURRENT_SITE: 1,
      BLOG_ID_CURRENT_SITE: 1,
      DOMAIN_CURRENT_SITE: t.hostname,
      PATH_CURRENT_SITE: f
    }
  });
  const I = new URL(await r.absoluteUrl), v = $r(I) ? "scope:" + Er(I) : null;
  await r.writeFile(
    "/internal/shared/preload/sunrise.php",
    `<?php
	$_SERVER['HTTP_HOST'] = ${se(I.hostname)};
	$folder = ${se(v)};
	if ($folder && strpos($_SERVER['REQUEST_URI'],"/$folder") === false) {
		$_SERVER['REQUEST_URI'] = "/$folder/" . ltrim($_SERVER['REQUEST_URI'], '/');
	}
`
  ), await r.writeFile(
    "/internal/shared/mu-plugins/sunrise.php",
    `<?php
		if ( !defined( 'BLOG_ID_CURRENT_SITE' ) ) {
			define( 'BLOG_ID_CURRENT_SITE', 1 );
		}
`
  ), await Xe(r, {});
  for (const M of e)
    await Ke(r, {
      pluginPath: M
    });
};
function Wr(r) {
  return Object.keys(r).map(
    (t) => encodeURIComponent(t) + "=" + encodeURIComponent(r[t])
  ).join("&");
}
const Br = async (r, { fromPath: t, toPath: f }) => {
  await r.writeFile(
    f,
    await r.readFileAsBuffer(t)
  );
}, Dr = async (r, { fromPath: t, toPath: f }) => {
  await r.mv(t, f);
}, Mr = async (r, { path: t }) => {
  await r.mkdir(t);
}, zr = async (r, { path: t }) => {
  await r.rmdir(t);
}, ur = async (r, { path: t, data: f }) => {
  f instanceof File && (f = new Uint8Array(await f.arrayBuffer())), t.startsWith("/wordpress/wp-content/mu-plugins") && !await r.fileExists("/wordpress/wp-content/mu-plugins") && await r.mkdir("/wordpress/wp-content/mu-plugins"), await r.writeFile(t, f);
}, cr = async (r, { siteUrl: t }) => {
  await Ve(r, {
    consts: {
      WP_HOME: t,
      WP_SITEURL: t
    }
  });
}, Vr = async (r, { file: t }, f) => {
  var u;
  (u = f == null ? void 0 : f.tracker) == null || u.setCaption("Importing content"), await ur(r, {
    path: "/tmp/import.wxr",
    data: t
  });
  const c = await r.documentRoot;
  await r.run({
    code: `<?php
		require ${se(c)} . '/wp-load.php';
		require ${se(c)} . '/wp-admin/includes/admin.php';
  
		kses_remove_filters();
		$admin_id = get_users(array('role' => 'Administrator') )[0]->ID;
        wp_set_current_user( $admin_id );
		$importer = new WXR_Importer( array(
			'fetch_attachments' => true,
			'default_author' => $admin_id
		) );
		$logger = new WP_Importer_Logger_CLI();
		$importer->set_logger( $logger );

		// Slashes from the imported content are lost if we don't call wp_slash here.
		add_action( 'wp_insert_post_data', function( $data ) {
			return wp_slash($data);
		});

		$result = $importer->import( '/tmp/import.wxr' );
		`
  });
}, mr = async (r, { themeSlug: t = "" }, f) => {
  var u;
  (u = f == null ? void 0 : f.tracker) == null || u.setCaption("Importing theme starter content");
  const c = await r.documentRoot;
  await r.run({
    code: `<?php

		/**
		 * Ensure that the customizer loads as an admin user.
		 *
		 * For compatibility with themes, this MUST be run prior to theme inclusion, which is why this is a plugins_loaded filter instead
		 * of running _wp_customize_include() manually after load.
		 */
		function importThemeStarterContent_plugins_loaded() {
			// Set as the admin user, this ensures we can customize the site.
			wp_set_current_user(
				get_users( [ 'role' => 'Administrator' ] )[0]
			);

			// Force the site to be fresh, although it should already be.
			add_filter( 'pre_option_fresh_site', '__return_true' );

			/*
			 * Simulate this request as the customizer loading with the current theme in preview mode.
			 *
			 * See _wp_customize_include()
			 */
			$_REQUEST['wp_customize']    = 'on';
			$_REQUEST['customize_theme'] = ${se(t)} ?: get_stylesheet();

			/*
			 * Claim this is a ajax request saving settings, to avoid the preview filters being applied.
			 */
			$_REQUEST['action'] = 'customize_save';
			add_filter( 'wp_doing_ajax', '__return_true' );

			$_GET = $_REQUEST;
		}
		playground_add_filter( 'plugins_loaded', 'importThemeStarterContent_plugins_loaded', 0 );

		require ${se(c)} . '/wp-load.php';

		// Return early if there's no starter content.
		if ( ! get_theme_starter_content() ) {
			return;
		}

		// Import the Starter Content.
		$wp_customize->import_theme_starter_content();

		// Publish the changeset, which publishes the starter content.
		wp_publish_post( $wp_customize->changeset_post_id() );
		`
  });
}, er = async (r, { zipFile: t, zipPath: f, extractToPath: c }) => {
  if (f)
    me.warn(
      'The "zipPath" option of the unzip() Blueprint step is deprecated and will be removed. Use "zipFile" instead.'
    );
  else if (!t)
    throw new Error("Either zipPath or zipFile must be provided");
  await ar(r, t || f, c);
}, Hr = async (r, { wordPressFilesZip: t, pathInZip: f = "" }) => {
  const c = await r.documentRoot;
  let u = oe("/tmp", "import");
  await r.mkdir(u), await er(r, {
    zipFile: t,
    extractToPath: u
  }), u = oe(u, f);
  const i = oe(u, "wp-content"), e = oe(c, "wp-content");
  for (const I of pr) {
    const v = oe(
      i,
      I
    );
    await ir(r, v);
    const R = oe(e, I);
    await r.fileExists(R) && (await r.mkdir(_r(v)), await r.mv(R, v));
  }
  const d = oe(
    u,
    "wp-content",
    "database"
  );
  await r.fileExists(d) || await r.mv(
    oe(c, "wp-content", "database"),
    d
  );
  const O = await r.listFiles(u);
  for (const I of O)
    await ir(r, oe(c, I)), await r.mv(
      oe(u, I),
      oe(c, I)
    );
  await r.rmdir(u), await cr(r, {
    siteUrl: await r.absoluteUrl
  });
  const B = se(
    oe(c, "wp-admin", "upgrade.php")
  );
  await r.run({
    code: `<?php
            $_GET['step'] = 'upgrade_db';
            require ${B};
            `
  });
};
async function ir(r, t) {
  await r.fileExists(t) && (await r.isDir(t) ? await r.rmdir(t) : await r.unlink(t));
}
async function Gr(r) {
  const t = await r.request({
    url: "/wp-admin/export.php?download=true&content=all"
  });
  return new File([t.bytes], "export.xml");
}
async function yr(r, {
  targetPath: t,
  zipFile: f,
  ifAlreadyInstalled: c = "overwrite"
}) {
  const i = f.name.replace(/\.zip$/, ""), e = oe(await r.documentRoot, "wp-content"), d = oe(e, kr()), O = oe(d, "assets", i);
  await r.fileExists(O) && await r.rmdir(d, {
    recursive: !0
  }), await r.mkdir(d);
  try {
    await er(r, {
      zipFile: f,
      extractToPath: O
    });
    let B = await r.listFiles(O, {
      prependPath: !0
    });
    B = B.filter((U) => !U.endsWith("/__MACOSX"));
    const I = B.length === 1 && await r.isDir(B[0]);
    let v, R = "";
    I ? (R = B[0], v = B[0].split("/").pop()) : (R = O, v = i);
    const M = `${t}/${v}`;
    if (await r.fileExists(M)) {
      if (!await r.isDir(M))
        throw new Error(
          `Cannot install asset ${v} to ${M} because a file with the same name already exists. Note it's a file, not a directory! Is this by mistake?`
        );
      if (c === "overwrite")
        await r.rmdir(M, {
          recursive: !0
        });
      else {
        if (c === "skip")
          return {
            assetFolderPath: M,
            assetFolderName: v
          };
        throw new Error(
          `Cannot install asset ${v} to ${t} because it already exists and the ifAlreadyInstalled option was set to ${c}`
        );
      }
    }
    return await r.mv(R, M), {
      assetFolderPath: M,
      assetFolderName: v
    };
  } finally {
    await r.rmdir(d, {
      recursive: !0
    });
  }
}
function He(r) {
  const t = r.split(".").shift().replace(/-/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const Yr = async (r, { pluginZipFile: t, ifAlreadyInstalled: f, options: c = {} }, u) => {
  const i = t.name.split("/").pop() || "plugin.zip", e = He(i);
  u == null || u.tracker.setCaption(`Installing the ${e} plugin`);
  const { assetFolderPath: d } = await yr(r, {
    ifAlreadyInstalled: f,
    zipFile: t,
    targetPath: `${await r.documentRoot}/wp-content/plugins`
  });
  ("activate" in c ? c.activate : !0) && await Ke(
    r,
    {
      pluginPath: d,
      pluginName: e
    },
    u
  );
}, Zr = async (r, { themeZipFile: t, ifAlreadyInstalled: f, options: c = {} }, u) => {
  const i = He(t.name);
  u == null || u.tracker.setCaption(`Installing the ${i} theme`);
  const { assetFolderName: e } = await yr(r, {
    ifAlreadyInstalled: f,
    zipFile: t,
    targetPath: `${await r.documentRoot}/wp-content/themes`
  });
  ("activate" in c ? c.activate : !0) && await fr(
    r,
    {
      themeFolderName: e
    },
    u
  ), ("importStarterContent" in c ? c.importStarterContent : !1) && await mr(
    r,
    {
      themeSlug: e
    },
    u
  );
}, Qr = async (r, t, f) => {
  var u;
  (u = f == null ? void 0 : f.tracker) == null || u.setCaption("Resetting WordPress data");
  const c = await r.documentRoot;
  await r.run({
    env: {
      DOCROOT: c
    },
    code: `<?php
		require getenv('DOCROOT') . '/wp-load.php';

		$GLOBALS['@pdo']->query('DELETE FROM wp_posts WHERE id > 0');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='wp_posts'");
		
		$GLOBALS['@pdo']->query('DELETE FROM wp_postmeta WHERE post_id > 1');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=20 WHERE NAME='wp_postmeta'");

		$GLOBALS['@pdo']->query('DELETE FROM wp_comments');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='wp_comments'");

		$GLOBALS['@pdo']->query('DELETE FROM wp_commentmeta');
		$GLOBALS['@pdo']->query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='wp_commentmeta'");
		`
  });
}, Xr = async (r, { options: t }) => {
  await r.request({
    url: "/wp-admin/install.php?step=2",
    method: "POST",
    body: {
      language: "en",
      prefix: "wp_",
      weblog_title: "My WordPress Website",
      user_name: t.adminPassword || "admin",
      admin_password: t.adminPassword || "password",
      // The installation wizard demands typing the same password twice
      admin_password2: t.adminPassword || "password",
      Submit: "Install WordPress",
      pw_weak: "1",
      admin_email: "admin@localhost.com"
    }
  });
}, Jr = async (r, { selfContained: t = !1 } = {}) => {
  const f = "/tmp/wordpress-playground.zip", c = await r.documentRoot, u = oe(c, "wp-content");
  let i = pr;
  t && (i = i.filter((O) => !O.startsWith("themes/twenty")).filter(
    (O) => O !== "mu-plugins/sqlite-database-integration"
  ));
  const e = Je({
    zipPath: f,
    wpContentPath: u,
    documentRoot: c,
    exceptPaths: i.map(
      (O) => oe(c, "wp-content", O)
    ),
    additionalPaths: t ? {
      [oe(c, "wp-config.php")]: "wp-config.php"
    } : {}
  });
  await et(
    r,
    `zipDir(${e.wpContentPath}, ${e.zipPath}, array(
			'exclude_paths' => ${e.exceptPaths},
			'zip_root'      => ${e.documentRoot},
			'additional_paths' => ${e.additionalPaths}
		));`
  );
  const d = await r.readFileAsBuffer(f);
  return r.unlink(f), d;
}, Kr = `<?php

function zipDir($root, $output, $options = array())
{
    $root = rtrim($root, '/');
    $additionalPaths = array_key_exists('additional_paths', $options) ? $options['additional_paths'] : array();
    $excludePaths = array_key_exists('exclude_paths', $options) ? $options['exclude_paths'] : array();
    $zip_root = array_key_exists('zip_root', $options) ? $options['zip_root'] : $root;

    $zip = new ZipArchive;
    $res = $zip->open($output, ZipArchive::CREATE);
    if ($res === TRUE) {
        $directories = array(
            $root . '/'
        );
        while (sizeof($directories)) {
            $current_dir = array_pop($directories);

            if ($handle = opendir($current_dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry == '.' || $entry == '..') {
                        continue;
                    }

                    $entry = join_paths($current_dir, $entry);
                    if (in_array($entry, $excludePaths)) {
                        continue;
                    }

                    if (is_dir($entry)) {
                        $directory_path = $entry . '/';
                        array_push($directories, $directory_path);
                    } else if (is_file($entry)) {
                        $zip->addFile($entry, substr($entry, strlen($zip_root)));
                    }
                }
                closedir($handle);
            }
        }
        foreach ($additionalPaths as $disk_path => $zip_path) {
            $zip->addFile($disk_path, $zip_path);
        }
        $zip->close();
        chmod($output, 0777);
    }
}

function join_paths()
{
    $paths = array();

    foreach (func_get_args() as $arg) {
        if ($arg !== '') {
            $paths[] = $arg;
        }
    }

    return preg_replace('#/+#', '/', join('/', $paths));
}
`;
async function et(r, t) {
  return await r.run({
    code: Kr + t
  });
}
const rt = async (r, { command: t, wpCliPath: f = "/tmp/wp-cli.phar" }) => {
  if (!await r.fileExists(f))
    throw new Error(`wp-cli.phar not found at ${f}.
			You can enable wp-cli support by adding "wp-cli" to the list of extra libraries in your blueprint as follows:
			{
				"extraLibraries": [ "wp-cli" ]
			}

			Read more about it in the documentation.
			https://wordpress.github.io/wordpress-playground/blueprints/data-format#extra-libraries`);
  let c;
  if (typeof t == "string" ? (t = t.trim(), c = tt(t)) : c = t, c.shift() !== "wp")
    throw new Error('The first argument must be "wp".');
  await r.writeFile("/tmp/stdout", ""), await r.writeFile("/tmp/stderr", ""), await r.writeFile(
    "/wordpress/run-cli.php",
    `<?php
		// Set up the environment to emulate a shell script
		// call.

		// Set SHELL_PIPE to 0 to ensure WP-CLI formats
		// the output as ASCII tables.
		// @see https://github.com/wp-cli/wp-cli/issues/1102
		putenv( 'SHELL_PIPE=0' );

		// Set the argv global.
		$GLOBALS['argv'] = array_merge([
		  "/tmp/wp-cli.phar",
		  "--path=/wordpress"
		], ${se(c)});

		// Provide stdin, stdout, stderr streams outside of
		// the CLI SAPI.
		define('STDIN', fopen('php://stdin', 'rb'));
		define('STDOUT', fopen('php://stdout', 'wb'));
		define('STDERR', fopen('php://stderr', 'wb'));

		require( ${se(f)} );
		`
  );
  const i = await r.run({
    scriptPath: "/wordpress/run-cli.php"
  });
  if (i.errors)
    throw new Error(i.errors);
  return i;
};
function tt(r) {
  let c = 0, u = "";
  const i = [];
  let e = "";
  for (let d = 0; d < r.length; d++) {
    const O = r[d];
    c === 0 ? O === '"' || O === "'" ? (c = 1, u = O) : O.match(/\s/) ? (e && i.push(e), e = "") : e += O : c === 1 && (O === "\\" ? (d++, e += r[d]) : O === u ? (c = 0, u = "") : e += O);
  }
  return e && i.push(e), i;
}
const st = async (r, { language: t }, f) => {
  f == null || f.tracker.setCaption((f == null ? void 0 : f.initialCaption) || "Translating"), await r.defineConstant("WPLANG", t);
  const c = await r.documentRoot, i = [
    {
      url: `https://downloads.wordpress.org/translation/core/${(await r.run({
        code: `<?php
			require '${c}/wp-includes/version.php';
			echo $wp_version;
		`
      })).text}/${t}.zip`,
      type: "core"
    }
  ], d = (await r.run({
    code: `<?php
		require_once('${c}/wp-load.php');
		require_once('${c}/wp-admin/includes/plugin.php');
		echo json_encode(
			array_values(
				array_map(
					function($plugin) {
						return [
							'slug'    => $plugin['TextDomain'],
							'version' => $plugin['Version']
						];
					},
					array_filter(
						get_plugins(),
						function($plugin) {
							return !empty($plugin['TextDomain']);
						}
					)
				)
			)
		);`
  })).json;
  for (const { slug: I, version: v } of d)
    i.push({
      url: `https://downloads.wordpress.org/translation/plugin/${I}/${v}/${t}.zip`,
      type: "plugin"
    });
  const B = (await r.run({
    code: `<?php
		require_once('${c}/wp-load.php');
		require_once('${c}/wp-admin/includes/theme.php');
		echo json_encode(
			array_values(
				array_map(
					function($theme) {
						return [
							'slug'    => $theme->get('TextDomain'),
							'version' => $theme->get('Version')
						];
					},
					wp_get_themes()
				)
			)
		);`
  })).json;
  for (const { slug: I, version: v } of B)
    i.push({
      url: `https://downloads.wordpress.org/translation/theme/${I}/${v}/${t}.zip`,
      type: "theme"
    });
  await r.isDir(`${c}/wp-content/languages/plugins`) || await r.mkdir(`${c}/wp-content/languages/plugins`), await r.isDir(`${c}/wp-content/languages/themes`) || await r.mkdir(`${c}/wp-content/languages/themes`);
  for (const { url: I, type: v } of i)
    try {
      const R = await fetch(I);
      if (!R.ok)
        throw new Error(
          `Failed to download translations for ${v}: ${R.statusText}`
        );
      let M = `${c}/wp-content/languages`;
      v === "plugin" ? M += "/plugins" : v === "theme" && (M += "/themes"), await ar(
        r,
        new File([await R.blob()], `${t}-${v}.zip`),
        M
      );
    } catch (R) {
      if (v === "core")
        throw new Error(
          `Failed to download translations for WordPress. Please check if the language code ${t} is correct. You can find all available languages and translations on https://translate.wordpress.org/.`
        );
      me.warn(`Error downloading translations for ${v}: ${R}`);
    }
}, it = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activatePlugin: Ke,
  activateTheme: fr,
  cp: Br,
  defineSiteUrl: cr,
  defineWpConfigConsts: Ve,
  enableMultisite: Ur,
  exportWXR: Gr,
  importThemeStarterContent: mr,
  importWordPressFiles: Hr,
  importWxr: Vr,
  installPlugin: Yr,
  installTheme: Zr,
  login: Xe,
  mkdir: Mr,
  mv: Dr,
  request: Qe,
  resetData: Qr,
  rm: lr,
  rmdir: zr,
  runPHP: Lr,
  runPHPWithOptions: Sr,
  runSql: Nr,
  runWpInstallationWizard: Xr,
  setSiteLanguage: st,
  setSiteOptions: dr,
  unzip: er,
  updateUserMeta: Ir,
  wpCLI: rt,
  writeFile: ur,
  zipWpContent: Jr
}, Symbol.toStringTag, { value: "Module" })), ot = [
  "vfs",
  "literal",
  "wordpress.org/themes",
  "wordpress.org/plugins",
  "url"
];
function nt(r) {
  return r && typeof r == "object" && typeof r.resource == "string" && ot.includes(r.resource);
}
class Ee {
  /**
   * Creates a new Resource based on the given file reference
   *
   * @param ref The file reference to create the Resource for
   * @param options Additional options for the Resource
   * @returns A new Resource instance
   */
  static create(t, { semaphore: f, progress: c }) {
    let u;
    switch (t.resource) {
      case "vfs":
        u = new at(t, c);
        break;
      case "literal":
        u = new pt(t, c);
        break;
      case "wordpress.org/themes":
        u = new dt(t, c);
        break;
      case "wordpress.org/plugins":
        u = new ut(t, c);
        break;
      case "url":
        u = new lt(t, c);
        break;
      default:
        throw new Error(`Invalid resource: ${t}`);
    }
    return u = new ct(u), f && (u = new mt(u, f)), u;
  }
  setPlayground(t) {
    this.playground = t;
  }
  /** Whether this Resource is loaded asynchronously */
  get isAsync() {
    return !1;
  }
}
class at extends Ee {
  /**
   * Creates a new instance of `VFSResource`.
   * @param playground The playground client.
   * @param resource The VFS reference.
   * @param progress The progress tracker.
   */
  constructor(t, f) {
    super(), this.resource = t, this.progress = f;
  }
  /** @inheritDoc */
  async resolve() {
    var f;
    const t = await this.playground.readFileAsBuffer(
      this.resource.path
    );
    return (f = this.progress) == null || f.set(100), new File([t], this.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.path.split("/").pop() || "";
  }
}
class pt extends Ee {
  /**
   * Creates a new instance of `LiteralResource`.
   * @param resource The literal reference.
   * @param progress The progress tracker.
   */
  constructor(t, f) {
    super(), this.resource = t, this.progress = f;
  }
  /** @inheritDoc */
  async resolve() {
    var t;
    return (t = this.progress) == null || t.set(100), new File([this.resource.contents], this.resource.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
}
class rr extends Ee {
  /**
   * Creates a new instance of `FetchResource`.
   * @param progress The progress tracker.
   */
  constructor(t) {
    super(), this.progress = t;
  }
  /** @inheritDoc */
  async resolve() {
    var f, c;
    (f = this.progress) == null || f.setCaption(this.caption);
    const t = this.getURL();
    try {
      let u = await fetch(t);
      if (!u.ok)
        throw new Error(`Could not download "${t}"`);
      if (u = await Tr(
        u,
        ((c = this.progress) == null ? void 0 : c.loadingListener) ?? ft
      ), u.status !== 200)
        throw new Error(`Could not download "${t}"`);
      return new File([await u.blob()], this.name);
    } catch (u) {
      throw new Error(
        `Could not download "${t}".
				Check if the URL is correct and the server is reachable.
				If it is reachable, the server might be blocking the request.
				Check the browser console and network tabs for more information.

				## Does the console show the error "No 'Access-Control-Allow-Origin' header"?

				This means the server that hosts your file does not allow requests from other sites
				(cross-origin requests, or CORS).	You need to move the asset to a server that allows
				cross-origin file downloads. Learn more about CORS at
				https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS.

				If your file is on GitHub, load it from "raw.githubusercontent.com".
				Here's how to do that:

				1. Start with the original GitHub URL of the file. For example:
				https://github.com/username/repository/blob/branch/filename.
				2. Replace "github.com" with "raw.githubusercontent.com".
				3. Remove the "/blob/" part of the URL.

				The resulting URL should look like this:
				https://raw.githubusercontent.com/username/repository/branch/filename

				Error:
				${u}`
      );
    }
  }
  /**
   * Gets the caption for the progress tracker.
   * @returns The caption.
   */
  get caption() {
    return `Downloading ${this.name}`;
  }
  /** @inheritDoc */
  get name() {
    try {
      return new URL(this.getURL(), "http://example.com").pathname.split("/").pop();
    } catch {
      return this.getURL();
    }
  }
  /** @inheritDoc */
  get isAsync() {
    return !0;
  }
}
const ft = () => {
};
class lt extends rr {
  /**
   * Creates a new instance of `UrlResource`.
   * @param resource The URL reference.
   * @param progress The progress tracker.
   */
  constructor(t, f) {
    super(f), this.resource = t;
  }
  /** @inheritDoc */
  getURL() {
    return this.resource.url;
  }
  /** @inheritDoc */
  get caption() {
    return this.resource.caption ?? super.caption;
  }
}
class dt extends rr {
  constructor(t, f) {
    super(f), this.resource = t;
  }
  get name() {
    return He(this.resource.slug);
  }
  getURL() {
    return `https://downloads.wordpress.org/theme/${hr(this.resource.slug)}`;
  }
}
class ut extends rr {
  constructor(t, f) {
    super(f), this.resource = t;
  }
  /** @inheritDoc */
  get name() {
    return He(this.resource.slug);
  }
  /** @inheritDoc */
  getURL() {
    return `https://downloads.wordpress.org/plugin/${hr(this.resource.slug)}`;
  }
}
function hr(r) {
  return !r || r.endsWith(".zip") ? r : r + ".latest-stable.zip";
}
class gr extends Ee {
  constructor(t) {
    super(), this.resource = t;
  }
  /** @inheritDoc */
  async resolve() {
    return this.resource.resolve();
  }
  /** @inheritDoc */
  async setPlayground(t) {
    return this.resource.setPlayground(t);
  }
  /** @inheritDoc */
  get progress() {
    return this.resource.progress;
  }
  /** @inheritDoc */
  set progress(t) {
    this.resource.progress = t;
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
  /** @inheritDoc */
  get isAsync() {
    return this.resource.isAsync;
  }
}
class ct extends gr {
  /** @inheritDoc */
  async resolve() {
    return this.promise || (this.promise = super.resolve()), this.promise;
  }
}
class mt extends gr {
  constructor(t, f) {
    super(t), this.semaphore = f;
  }
  /** @inheritDoc */
  async resolve() {
    return this.isAsync ? this.semaphore.run(() => super.resolve()) : super.resolve();
  }
}
const yt = {
  type: "object",
  properties: {
    landingPage: {
      type: "string",
      description: "The URL to navigate to after the blueprint has been run."
    },
    description: {
      type: "string",
      description: "Optional description. It doesn't do anything but is exposed as a courtesy to developers who may want to document which blueprint file does what.",
      deprecated: "Use meta.description instead."
    },
    meta: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "A clear and concise name for your Blueprint."
        },
        description: {
          type: "string",
          description: "A brief explanation of what your Blueprint offers."
        },
        author: {
          type: "string",
          description: "A GitHub username of the author of this Blueprint."
        },
        categories: {
          type: "array",
          items: { type: "string" },
          description: "Relevant categories to help users find your Blueprint in the future Blueprints section on WordPress.org."
        }
      },
      required: ["title", "author"],
      additionalProperties: !1,
      description: "Optional metadata. Used by the Blueprints gallery at https://github.com/WordPress/blueprints"
    },
    preferredVersions: {
      type: "object",
      properties: {
        php: {
          anyOf: [
            { $ref: "#/definitions/SupportedPHPVersion" },
            { type: "string", const: "latest" }
          ],
          description: "The preferred PHP version to use. If not specified, the latest supported version will be used"
        },
        wp: {
          type: "string",
          description: "The preferred WordPress version to use. If not specified, the latest supported version will be used"
        }
      },
      required: ["php", "wp"],
      additionalProperties: !1,
      description: "The preferred PHP and WordPress versions to use."
    },
    features: {
      type: "object",
      properties: {
        networking: {
          type: "boolean",
          description: "Should boot with support for network request via wp_safe_remote_get?"
        }
      },
      additionalProperties: !1
    },
    extraLibraries: {
      type: "array",
      items: { $ref: "#/definitions/ExtraLibrary" },
      description: "Extra libraries to preload into the Playground instance."
    },
    constants: {
      type: "object",
      additionalProperties: { type: "string" },
      description: "PHP Constants to define on every request"
    },
    plugins: {
      type: "array",
      items: {
        anyOf: [
          { type: "string" },
          { $ref: "#/definitions/FileReference" }
        ]
      },
      description: "WordPress plugins to install and activate"
    },
    siteOptions: {
      type: "object",
      additionalProperties: { type: "string" },
      properties: {
        blogname: { type: "string", description: "The site title" }
      },
      description: "WordPress site options to define"
    },
    login: {
      anyOf: [
        { type: "boolean" },
        {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" }
          },
          required: ["username", "password"],
          additionalProperties: !1
        }
      ],
      description: "User to log in as. If true, logs the user in as admin/password."
    },
    phpExtensionBundles: {
      type: "array",
      items: { $ref: "#/definitions/SupportedPHPExtensionBundle" },
      description: "The PHP extensions to use."
    },
    steps: {
      type: "array",
      items: {
        anyOf: [
          { $ref: "#/definitions/StepDefinition" },
          { type: "string" },
          { not: {} },
          { type: "boolean", const: !1 },
          { type: "null" }
        ]
      },
      description: "The steps to run after every other operation in this Blueprint was executed."
    },
    $schema: { type: "string" }
  },
  additionalProperties: !1
}, ht = {
  type: "string",
  enum: ["8.3", "8.2", "8.1", "8.0", "7.4", "7.3", "7.2", "7.1", "7.0"]
}, gt = { type: "string", enum: ["kitchen-sink", "light"] }, br = Object.prototype.hasOwnProperty;
function re(r, { instancePath: t = "", parentData: f, parentDataProperty: c, rootData: u = r } = {}) {
  let i = null, e = 0;
  const d = e;
  let O = !1;
  const B = e;
  if (e === e)
    if (r && typeof r == "object" && !Array.isArray(r)) {
      let A;
      if (r.resource === void 0 && (A = "resource") || r.path === void 0 && (A = "path")) {
        const F = {
          instancePath: t,
          schemaPath: "#/definitions/VFSReference/required",
          keyword: "required",
          params: { missingProperty: A },
          message: "must have required property '" + A + "'"
        };
        i === null ? i = [F] : i.push(F), e++;
      } else {
        const F = e;
        for (const z in r)
          if (!(z === "resource" || z === "path")) {
            const l = {
              instancePath: t,
              schemaPath: "#/definitions/VFSReference/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: z },
              message: "must NOT have additional properties"
            };
            i === null ? i = [l] : i.push(l), e++;
            break;
          }
        if (F === e) {
          if (r.resource !== void 0) {
            let z = r.resource;
            const l = e;
            if (typeof z != "string") {
              const E = {
                instancePath: t + "/resource",
                schemaPath: "#/definitions/VFSReference/properties/resource/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              };
              i === null ? i = [E] : i.push(E), e++;
            }
            if (z !== "vfs") {
              const E = {
                instancePath: t + "/resource",
                schemaPath: "#/definitions/VFSReference/properties/resource/const",
                keyword: "const",
                params: { allowedValue: "vfs" },
                message: "must be equal to constant"
              };
              i === null ? i = [E] : i.push(E), e++;
            }
            var v = l === e;
          } else
            var v = !0;
          if (v)
            if (r.path !== void 0) {
              const z = e;
              if (typeof r.path != "string") {
                const E = {
                  instancePath: t + "/path",
                  schemaPath: "#/definitions/VFSReference/properties/path/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                };
                i === null ? i = [E] : i.push(E), e++;
              }
              var v = z === e;
            } else
              var v = !0;
        }
      }
    } else {
      const A = {
        instancePath: t,
        schemaPath: "#/definitions/VFSReference/type",
        keyword: "type",
        params: { type: "object" },
        message: "must be object"
      };
      i === null ? i = [A] : i.push(A), e++;
    }
  var R = B === e;
  if (O = O || R, !O) {
    const A = e;
    if (e === e)
      if (r && typeof r == "object" && !Array.isArray(r)) {
        let l;
        if (r.resource === void 0 && (l = "resource") || r.name === void 0 && (l = "name") || r.contents === void 0 && (l = "contents")) {
          const E = {
            instancePath: t,
            schemaPath: "#/definitions/LiteralReference/required",
            keyword: "required",
            params: { missingProperty: l },
            message: "must have required property '" + l + "'"
          };
          i === null ? i = [E] : i.push(E), e++;
        } else {
          const E = e;
          for (const _ in r)
            if (!(_ === "resource" || _ === "name" || _ === "contents")) {
              const k = {
                instancePath: t,
                schemaPath: "#/definitions/LiteralReference/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: _ },
                message: "must NOT have additional properties"
              };
              i === null ? i = [k] : i.push(k), e++;
              break;
            }
          if (E === e) {
            if (r.resource !== void 0) {
              let _ = r.resource;
              const k = e;
              if (typeof _ != "string") {
                const g = {
                  instancePath: t + "/resource",
                  schemaPath: "#/definitions/LiteralReference/properties/resource/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                };
                i === null ? i = [g] : i.push(g), e++;
              }
              if (_ !== "literal") {
                const g = {
                  instancePath: t + "/resource",
                  schemaPath: "#/definitions/LiteralReference/properties/resource/const",
                  keyword: "const",
                  params: { allowedValue: "literal" },
                  message: "must be equal to constant"
                };
                i === null ? i = [g] : i.push(g), e++;
              }
              var M = k === e;
            } else
              var M = !0;
            if (M) {
              if (r.name !== void 0) {
                const _ = e;
                if (typeof r.name != "string") {
                  const g = {
                    instancePath: t + "/name",
                    schemaPath: "#/definitions/LiteralReference/properties/name/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  };
                  i === null ? i = [g] : i.push(g), e++;
                }
                var M = _ === e;
              } else
                var M = !0;
              if (M)
                if (r.contents !== void 0) {
                  let _ = r.contents;
                  const k = e, g = e;
                  let m = !1;
                  const y = e;
                  if (typeof _ != "string") {
                    const w = {
                      instancePath: t + "/contents",
                      schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/0/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    };
                    i === null ? i = [w] : i.push(w), e++;
                  }
                  var U = y === e;
                  if (m = m || U, !m) {
                    const w = e;
                    if (e === w)
                      if (_ && typeof _ == "object" && !Array.isArray(_)) {
                        let T;
                        if (_.BYTES_PER_ELEMENT === void 0 && (T = "BYTES_PER_ELEMENT") || _.buffer === void 0 && (T = "buffer") || _.byteLength === void 0 && (T = "byteLength") || _.byteOffset === void 0 && (T = "byteOffset") || _.length === void 0 && (T = "length")) {
                          const x = {
                            instancePath: t + "/contents",
                            schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/required",
                            keyword: "required",
                            params: {
                              missingProperty: T
                            },
                            message: "must have required property '" + T + "'"
                          };
                          i === null ? i = [x] : i.push(x), e++;
                        } else {
                          const x = e;
                          for (const j in _)
                            if (!(j === "BYTES_PER_ELEMENT" || j === "buffer" || j === "byteLength" || j === "byteOffset" || j === "length")) {
                              let V = _[j];
                              const ee = e;
                              if (!(typeof V == "number" && isFinite(
                                V
                              ))) {
                                const X = {
                                  instancePath: t + "/contents/" + j.replace(
                                    /~/g,
                                    "~0"
                                  ).replace(
                                    /\//g,
                                    "~1"
                                  ),
                                  schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/additionalProperties/type",
                                  keyword: "type",
                                  params: {
                                    type: "number"
                                  },
                                  message: "must be number"
                                };
                                i === null ? i = [
                                  X
                                ] : i.push(
                                  X
                                ), e++;
                              }
                              var b = ee === e;
                              if (!b)
                                break;
                            }
                          if (x === e) {
                            if (_.BYTES_PER_ELEMENT !== void 0) {
                              let j = _.BYTES_PER_ELEMENT;
                              const V = e;
                              if (!(typeof j == "number" && isFinite(
                                j
                              ))) {
                                const ee = {
                                  instancePath: t + "/contents/BYTES_PER_ELEMENT",
                                  schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/BYTES_PER_ELEMENT/type",
                                  keyword: "type",
                                  params: {
                                    type: "number"
                                  },
                                  message: "must be number"
                                };
                                i === null ? i = [
                                  ee
                                ] : i.push(
                                  ee
                                ), e++;
                              }
                              var D = V === e;
                            } else
                              var D = !0;
                            if (D) {
                              if (_.buffer !== void 0) {
                                let j = _.buffer;
                                const V = e;
                                if (e === V)
                                  if (j && typeof j == "object" && !Array.isArray(
                                    j
                                  )) {
                                    let X;
                                    if (j.byteLength === void 0 && (X = "byteLength")) {
                                      const N = {
                                        instancePath: t + "/contents/buffer",
                                        schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/buffer/required",
                                        keyword: "required",
                                        params: {
                                          missingProperty: X
                                        },
                                        message: "must have required property '" + X + "'"
                                      };
                                      i === null ? i = [
                                        N
                                      ] : i.push(
                                        N
                                      ), e++;
                                    } else {
                                      const N = e;
                                      for (const Q in j)
                                        if (Q !== "byteLength") {
                                          const C = {
                                            instancePath: t + "/contents/buffer",
                                            schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/buffer/additionalProperties",
                                            keyword: "additionalProperties",
                                            params: {
                                              additionalProperty: Q
                                            },
                                            message: "must NOT have additional properties"
                                          };
                                          i === null ? i = [
                                            C
                                          ] : i.push(
                                            C
                                          ), e++;
                                          break;
                                        }
                                      if (N === e && j.byteLength !== void 0) {
                                        let Q = j.byteLength;
                                        if (!(typeof Q == "number" && isFinite(
                                          Q
                                        ))) {
                                          const C = {
                                            instancePath: t + "/contents/buffer/byteLength",
                                            schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/buffer/properties/byteLength/type",
                                            keyword: "type",
                                            params: {
                                              type: "number"
                                            },
                                            message: "must be number"
                                          };
                                          i === null ? i = [
                                            C
                                          ] : i.push(
                                            C
                                          ), e++;
                                        }
                                      }
                                    }
                                  } else {
                                    const X = {
                                      instancePath: t + "/contents/buffer",
                                      schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/buffer/type",
                                      keyword: "type",
                                      params: {
                                        type: "object"
                                      },
                                      message: "must be object"
                                    };
                                    i === null ? i = [
                                      X
                                    ] : i.push(
                                      X
                                    ), e++;
                                  }
                                var D = V === e;
                              } else
                                var D = !0;
                              if (D) {
                                if (_.byteLength !== void 0) {
                                  let j = _.byteLength;
                                  const V = e;
                                  if (!(typeof j == "number" && isFinite(
                                    j
                                  ))) {
                                    const X = {
                                      instancePath: t + "/contents/byteLength",
                                      schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/byteLength/type",
                                      keyword: "type",
                                      params: {
                                        type: "number"
                                      },
                                      message: "must be number"
                                    };
                                    i === null ? i = [
                                      X
                                    ] : i.push(
                                      X
                                    ), e++;
                                  }
                                  var D = V === e;
                                } else
                                  var D = !0;
                                if (D) {
                                  if (_.byteOffset !== void 0) {
                                    let j = _.byteOffset;
                                    const V = e;
                                    if (!(typeof j == "number" && isFinite(
                                      j
                                    ))) {
                                      const X = {
                                        instancePath: t + "/contents/byteOffset",
                                        schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/byteOffset/type",
                                        keyword: "type",
                                        params: {
                                          type: "number"
                                        },
                                        message: "must be number"
                                      };
                                      i === null ? i = [
                                        X
                                      ] : i.push(
                                        X
                                      ), e++;
                                    }
                                    var D = V === e;
                                  } else
                                    var D = !0;
                                  if (D)
                                    if (_.length !== void 0) {
                                      let j = _.length;
                                      const V = e;
                                      if (!(typeof j == "number" && isFinite(
                                        j
                                      ))) {
                                        const X = {
                                          instancePath: t + "/contents/length",
                                          schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/properties/length/type",
                                          keyword: "type",
                                          params: {
                                            type: "number"
                                          },
                                          message: "must be number"
                                        };
                                        i === null ? i = [
                                          X
                                        ] : i.push(
                                          X
                                        ), e++;
                                      }
                                      var D = V === e;
                                    } else
                                      var D = !0;
                                }
                              }
                            }
                          }
                        }
                      } else {
                        const T = {
                          instancePath: t + "/contents",
                          schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf/1/type",
                          keyword: "type",
                          params: { type: "object" },
                          message: "must be object"
                        };
                        i === null ? i = [T] : i.push(T), e++;
                      }
                    var U = w === e;
                    m = m || U;
                  }
                  if (m)
                    e = g, i !== null && (g ? i.length = g : i = null);
                  else {
                    const w = {
                      instancePath: t + "/contents",
                      schemaPath: "#/definitions/LiteralReference/properties/contents/anyOf",
                      keyword: "anyOf",
                      params: {},
                      message: "must match a schema in anyOf"
                    };
                    i === null ? i = [w] : i.push(w), e++;
                  }
                  var M = k === e;
                } else
                  var M = !0;
            }
          }
        }
      } else {
        const l = {
          instancePath: t,
          schemaPath: "#/definitions/LiteralReference/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        };
        i === null ? i = [l] : i.push(l), e++;
      }
    var R = A === e;
    if (O = O || R, !O) {
      const l = e;
      if (e === e)
        if (r && typeof r == "object" && !Array.isArray(r)) {
          let k;
          if (r.resource === void 0 && (k = "resource") || r.slug === void 0 && (k = "slug")) {
            const g = {
              instancePath: t,
              schemaPath: "#/definitions/CoreThemeReference/required",
              keyword: "required",
              params: { missingProperty: k },
              message: "must have required property '" + k + "'"
            };
            i === null ? i = [g] : i.push(g), e++;
          } else {
            const g = e;
            for (const m in r)
              if (!(m === "resource" || m === "slug")) {
                const y = {
                  instancePath: t,
                  schemaPath: "#/definitions/CoreThemeReference/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: m },
                  message: "must NOT have additional properties"
                };
                i === null ? i = [y] : i.push(y), e++;
                break;
              }
            if (g === e) {
              if (r.resource !== void 0) {
                let m = r.resource;
                const y = e;
                if (typeof m != "string") {
                  const h = {
                    instancePath: t + "/resource",
                    schemaPath: "#/definitions/CoreThemeReference/properties/resource/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  };
                  i === null ? i = [h] : i.push(h), e++;
                }
                if (m !== "wordpress.org/themes") {
                  const h = {
                    instancePath: t + "/resource",
                    schemaPath: "#/definitions/CoreThemeReference/properties/resource/const",
                    keyword: "const",
                    params: {
                      allowedValue: "wordpress.org/themes"
                    },
                    message: "must be equal to constant"
                  };
                  i === null ? i = [h] : i.push(h), e++;
                }
                var te = y === e;
              } else
                var te = !0;
              if (te)
                if (r.slug !== void 0) {
                  const m = e;
                  if (typeof r.slug != "string") {
                    const h = {
                      instancePath: t + "/slug",
                      schemaPath: "#/definitions/CoreThemeReference/properties/slug/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    };
                    i === null ? i = [h] : i.push(h), e++;
                  }
                  var te = m === e;
                } else
                  var te = !0;
            }
          }
        } else {
          const k = {
            instancePath: t,
            schemaPath: "#/definitions/CoreThemeReference/type",
            keyword: "type",
            params: { type: "object" },
            message: "must be object"
          };
          i === null ? i = [k] : i.push(k), e++;
        }
      var R = l === e;
      if (O = O || R, !O) {
        const k = e;
        if (e === e)
          if (r && typeof r == "object" && !Array.isArray(r)) {
            let y;
            if (r.resource === void 0 && (y = "resource") || r.slug === void 0 && (y = "slug")) {
              const h = {
                instancePath: t,
                schemaPath: "#/definitions/CorePluginReference/required",
                keyword: "required",
                params: { missingProperty: y },
                message: "must have required property '" + y + "'"
              };
              i === null ? i = [h] : i.push(h), e++;
            } else {
              const h = e;
              for (const w in r)
                if (!(w === "resource" || w === "slug")) {
                  const L = {
                    instancePath: t,
                    schemaPath: "#/definitions/CorePluginReference/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: w },
                    message: "must NOT have additional properties"
                  };
                  i === null ? i = [L] : i.push(L), e++;
                  break;
                }
              if (h === e) {
                if (r.resource !== void 0) {
                  let w = r.resource;
                  const L = e;
                  if (typeof w != "string") {
                    const T = {
                      instancePath: t + "/resource",
                      schemaPath: "#/definitions/CorePluginReference/properties/resource/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    };
                    i === null ? i = [T] : i.push(T), e++;
                  }
                  if (w !== "wordpress.org/plugins") {
                    const T = {
                      instancePath: t + "/resource",
                      schemaPath: "#/definitions/CorePluginReference/properties/resource/const",
                      keyword: "const",
                      params: {
                        allowedValue: "wordpress.org/plugins"
                      },
                      message: "must be equal to constant"
                    };
                    i === null ? i = [T] : i.push(T), e++;
                  }
                  var H = L === e;
                } else
                  var H = !0;
                if (H)
                  if (r.slug !== void 0) {
                    const w = e;
                    if (typeof r.slug != "string") {
                      const T = {
                        instancePath: t + "/slug",
                        schemaPath: "#/definitions/CorePluginReference/properties/slug/type",
                        keyword: "type",
                        params: { type: "string" },
                        message: "must be string"
                      };
                      i === null ? i = [T] : i.push(T), e++;
                    }
                    var H = w === e;
                  } else
                    var H = !0;
              }
            }
          } else {
            const y = {
              instancePath: t,
              schemaPath: "#/definitions/CorePluginReference/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object"
            };
            i === null ? i = [y] : i.push(y), e++;
          }
        var R = k === e;
        if (O = O || R, !O) {
          const y = e;
          if (e === e)
            if (r && typeof r == "object" && !Array.isArray(r)) {
              let L;
              if (r.resource === void 0 && (L = "resource") || r.url === void 0 && (L = "url")) {
                const T = {
                  instancePath: t,
                  schemaPath: "#/definitions/UrlReference/required",
                  keyword: "required",
                  params: { missingProperty: L },
                  message: "must have required property '" + L + "'"
                };
                i === null ? i = [T] : i.push(T), e++;
              } else {
                const T = e;
                for (const x in r)
                  if (!(x === "resource" || x === "url" || x === "caption")) {
                    const j = {
                      instancePath: t,
                      schemaPath: "#/definitions/UrlReference/additionalProperties",
                      keyword: "additionalProperties",
                      params: {
                        additionalProperty: x
                      },
                      message: "must NOT have additional properties"
                    };
                    i === null ? i = [j] : i.push(j), e++;
                    break;
                  }
                if (T === e) {
                  if (r.resource !== void 0) {
                    let x = r.resource;
                    const j = e;
                    if (typeof x != "string") {
                      const V = {
                        instancePath: t + "/resource",
                        schemaPath: "#/definitions/UrlReference/properties/resource/type",
                        keyword: "type",
                        params: { type: "string" },
                        message: "must be string"
                      };
                      i === null ? i = [V] : i.push(V), e++;
                    }
                    if (x !== "url") {
                      const V = {
                        instancePath: t + "/resource",
                        schemaPath: "#/definitions/UrlReference/properties/resource/const",
                        keyword: "const",
                        params: { allowedValue: "url" },
                        message: "must be equal to constant"
                      };
                      i === null ? i = [V] : i.push(V), e++;
                    }
                    var P = j === e;
                  } else
                    var P = !0;
                  if (P) {
                    if (r.url !== void 0) {
                      const x = e;
                      if (typeof r.url != "string") {
                        const V = {
                          instancePath: t + "/url",
                          schemaPath: "#/definitions/UrlReference/properties/url/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        };
                        i === null ? i = [V] : i.push(V), e++;
                      }
                      var P = x === e;
                    } else
                      var P = !0;
                    if (P)
                      if (r.caption !== void 0) {
                        const x = e;
                        if (typeof r.caption != "string") {
                          const V = {
                            instancePath: t + "/caption",
                            schemaPath: "#/definitions/UrlReference/properties/caption/type",
                            keyword: "type",
                            params: {
                              type: "string"
                            },
                            message: "must be string"
                          };
                          i === null ? i = [V] : i.push(V), e++;
                        }
                        var P = x === e;
                      } else
                        var P = !0;
                  }
                }
              }
            } else {
              const L = {
                instancePath: t,
                schemaPath: "#/definitions/UrlReference/type",
                keyword: "type",
                params: { type: "object" },
                message: "must be object"
              };
              i === null ? i = [L] : i.push(L), e++;
            }
          var R = y === e;
          O = O || R;
        }
      }
    }
  }
  if (O)
    e = d, i !== null && (d ? i.length = d : i = null);
  else {
    const A = {
      instancePath: t,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf"
    };
    return i === null ? i = [A] : i.push(A), e++, re.errors = i, !1;
  }
  return re.errors = i, e === 0;
}
const Ze = {
  type: "object",
  discriminator: { propertyName: "step" },
  required: ["step"],
  oneOf: [
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "activatePlugin" },
        pluginPath: {
          type: "string",
          description: "Path to the plugin directory as absolute path (/wordpress/wp-content/plugins/plugin-name); or the plugin entry file relative to the plugins directory (plugin-name/plugin-name.php)."
        },
        pluginName: {
          type: "string",
          description: "Optional. Plugin name to display in the progress bar."
        }
      },
      required: ["pluginPath", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "activateTheme" },
        themeFolderName: {
          type: "string",
          description: "The name of the theme folder inside wp-content/themes/"
        }
      },
      required: ["step", "themeFolderName"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "cp" },
        fromPath: { type: "string", description: "Source path" },
        toPath: { type: "string", description: "Target path" }
      },
      required: ["fromPath", "step", "toPath"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "defineWpConfigConsts" },
        consts: {
          type: "object",
          additionalProperties: {},
          description: "The constants to define"
        },
        method: {
          type: "string",
          enum: ["rewrite-wp-config", "define-before-run"],
          description: `The method of defining the constants in wp-config.php. Possible values are:

- rewrite-wp-config: Default. Rewrites the wp-config.php file to                      explicitly call define() with the requested                      name and value. This method alters the file                      on the disk, but it doesn't conflict with                      existing define() calls in wp-config.php.

- define-before-run: Defines the constant before running the requested                      script. It doesn't alter any files on the disk, but                      constants defined this way may conflict with existing                      define() calls in wp-config.php.`
        },
        virtualize: {
          type: "boolean",
          deprecated: `This option is noop and will be removed in a future version.
This option is only kept in here to avoid breaking Blueprint schema validation
for existing apps using this option.`
        }
      },
      required: ["consts", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "defineSiteUrl" },
        siteUrl: { type: "string", description: "The URL" }
      },
      required: ["siteUrl", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "enableMultisite" }
      },
      required: ["step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "importWxr" },
        file: {
          $ref: "#/definitions/FileReference",
          description: "The file to import"
        }
      },
      required: ["file", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: {
          type: "string",
          const: "importThemeStarterContent",
          description: "The step identifier."
        },
        themeSlug: {
          type: "string",
          description: "The name of the theme to import content from."
        }
      },
      required: ["step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "importWordPressFiles" },
        wordPressFilesZip: {
          $ref: "#/definitions/FileReference",
          description: "The zip file containing the top-level WordPress files and directories."
        },
        pathInZip: {
          type: "string",
          description: "The path inside the zip file where the WordPress files are."
        }
      },
      required: ["step", "wordPressFilesZip"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        ifAlreadyInstalled: {
          type: "string",
          enum: ["overwrite", "skip", "error"],
          description: "What to do if the asset already exists."
        },
        step: {
          type: "string",
          const: "installPlugin",
          description: "The step identifier."
        },
        pluginZipFile: {
          $ref: "#/definitions/FileReference",
          description: "The plugin zip file to install."
        },
        options: {
          $ref: "#/definitions/InstallPluginOptions",
          description: "Optional installation options."
        }
      },
      required: ["pluginZipFile", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        ifAlreadyInstalled: {
          type: "string",
          enum: ["overwrite", "skip", "error"],
          description: "What to do if the asset already exists."
        },
        step: {
          type: "string",
          const: "installTheme",
          description: "The step identifier."
        },
        themeZipFile: {
          $ref: "#/definitions/FileReference",
          description: "The theme zip file to install."
        },
        options: {
          type: "object",
          properties: {
            activate: {
              type: "boolean",
              description: "Whether to activate the theme after installing it."
            },
            importStarterContent: {
              type: "boolean",
              description: "Whether to import the theme's starter content after installing it."
            }
          },
          additionalProperties: !1,
          description: "Optional installation options."
        }
      },
      required: ["step", "themeZipFile"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "login" },
        username: {
          type: "string",
          description: "The user to log in as. Defaults to 'admin'."
        },
        password: {
          type: "string",
          description: "The password to log in with. Defaults to 'password'."
        }
      },
      required: ["step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "mkdir" },
        path: {
          type: "string",
          description: "The path of the directory you want to create"
        }
      },
      required: ["path", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "mv" },
        fromPath: { type: "string", description: "Source path" },
        toPath: { type: "string", description: "Target path" }
      },
      required: ["fromPath", "step", "toPath"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "resetData" }
      },
      required: ["step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "request" },
        request: {
          $ref: "#/definitions/PHPRequest",
          description: "Request details (See /wordpress-playground/api/universal/interface/PHPRequest)"
        }
      },
      required: ["request", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "rm" },
        path: { type: "string", description: "The path to remove" }
      },
      required: ["path", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "rmdir" },
        path: { type: "string", description: "The path to remove" }
      },
      required: ["path", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: {
          type: "string",
          const: "runPHP",
          description: "The step identifier."
        },
        code: { type: "string", description: "The PHP code to run." }
      },
      required: ["code", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "runPHPWithOptions" },
        options: {
          $ref: "#/definitions/PHPRunOptions",
          description: "Run options (See /wordpress-playground/api/universal/interface/PHPRunOptions/))"
        }
      },
      required: ["options", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "runWpInstallationWizard" },
        options: { $ref: "#/definitions/WordPressInstallationOptions" }
      },
      required: ["options", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: {
          type: "string",
          const: "runSql",
          description: "The step identifier."
        },
        sql: {
          $ref: "#/definitions/FileReference",
          description: "The SQL to run. Each non-empty line must contain a valid SQL query."
        }
      },
      required: ["sql", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: {
          type: "string",
          const: "setSiteOptions",
          description: 'The name of the step. Must be "setSiteOptions".'
        },
        options: {
          type: "object",
          additionalProperties: {},
          description: "The options to set on the site."
        }
      },
      required: ["options", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "unzip" },
        zipFile: {
          $ref: "#/definitions/FileReference",
          description: "The zip file to extract"
        },
        zipPath: {
          type: "string",
          description: "The path of the zip file to extract",
          deprecated: "Use zipFile instead."
        },
        extractToPath: {
          type: "string",
          description: "The path to extract the zip file to"
        }
      },
      required: ["extractToPath", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "updateUserMeta" },
        meta: {
          type: "object",
          additionalProperties: {},
          description: 'An object of user meta values to set, e.g. { "first_name": "John" }'
        },
        userId: { type: "number", description: "User ID" }
      },
      required: ["meta", "step", "userId"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "writeFile" },
        path: {
          type: "string",
          description: "The path of the file to write to"
        },
        data: {
          anyOf: [
            { $ref: "#/definitions/FileReference" },
            { type: "string" },
            {
              type: "object",
              properties: {
                BYTES_PER_ELEMENT: { type: "number" },
                buffer: {
                  type: "object",
                  properties: {
                    byteLength: { type: "number" }
                  },
                  required: ["byteLength"],
                  additionalProperties: !1
                },
                byteLength: { type: "number" },
                byteOffset: { type: "number" },
                length: { type: "number" }
              },
              required: [
                "BYTES_PER_ELEMENT",
                "buffer",
                "byteLength",
                "byteOffset",
                "length"
              ],
              additionalProperties: { type: "number" }
            }
          ],
          description: "The data to write"
        }
      },
      required: ["data", "path", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: {
          type: "string",
          const: "wp-cli",
          description: "The step identifier."
        },
        command: {
          anyOf: [
            { type: "string" },
            { type: "array", items: { type: "string" } }
          ],
          description: "The WP CLI command to run."
        },
        wpCliPath: { type: "string", description: "wp-cli.phar path" }
      },
      required: ["command", "step"]
    },
    {
      type: "object",
      additionalProperties: !1,
      properties: {
        progress: {
          type: "object",
          properties: {
            weight: { type: "number" },
            caption: { type: "string" }
          },
          additionalProperties: !1
        },
        step: { type: "string", const: "setSiteLanguage" },
        language: {
          type: "string",
          description: "The language to set, e.g. 'en_US'"
        }
      },
      required: ["language", "step"]
    }
  ]
}, wr = {
  type: "string",
  enum: ["GET", "POST", "HEAD", "OPTIONS", "PATCH", "PUT", "DELETE"]
};
function ce(r, { instancePath: t = "", parentData: f, parentDataProperty: c, rootData: u = r } = {}) {
  let i = null, e = 0;
  if (e === 0)
    if (r && typeof r == "object" && !Array.isArray(r)) {
      let te;
      if (r.url === void 0 && (te = "url"))
        return ce.errors = [
          {
            instancePath: t,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: te },
            message: "must have required property '" + te + "'"
          }
        ], !1;
      {
        const H = e;
        for (const P in r)
          if (!(P === "method" || P === "url" || P === "headers" || P === "body"))
            return ce.errors = [
              {
                instancePath: t,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: { additionalProperty: P },
                message: "must NOT have additional properties"
              }
            ], !1;
        if (H === e) {
          if (r.method !== void 0) {
            let P = r.method;
            const A = e;
            if (typeof P != "string")
              return ce.errors = [
                {
                  instancePath: t + "/method",
                  schemaPath: "#/definitions/HTTPMethod/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
              ], !1;
            if (!(P === "GET" || P === "POST" || P === "HEAD" || P === "OPTIONS" || P === "PATCH" || P === "PUT" || P === "DELETE"))
              return ce.errors = [
                {
                  instancePath: t + "/method",
                  schemaPath: "#/definitions/HTTPMethod/enum",
                  keyword: "enum",
                  params: { allowedValues: wr.enum },
                  message: "must be equal to one of the allowed values"
                }
              ], !1;
            var d = A === e;
          } else
            var d = !0;
          if (d) {
            if (r.url !== void 0) {
              const P = e;
              if (typeof r.url != "string")
                return ce.errors = [
                  {
                    instancePath: t + "/url",
                    schemaPath: "#/properties/url/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                ], !1;
              var d = P === e;
            } else
              var d = !0;
            if (d) {
              if (r.headers !== void 0) {
                let P = r.headers;
                const A = e;
                if (e === e)
                  if (P && typeof P == "object" && !Array.isArray(P))
                    for (const l in P) {
                      const E = e;
                      if (typeof P[l] != "string")
                        return ce.errors = [
                          {
                            instancePath: t + "/headers/" + l.replace(
                              /~/g,
                              "~0"
                            ).replace(
                              /\//g,
                              "~1"
                            ),
                            schemaPath: "#/definitions/PHPRequestHeaders/additionalProperties/type",
                            keyword: "type",
                            params: {
                              type: "string"
                            },
                            message: "must be string"
                          }
                        ], !1;
                      var O = E === e;
                      if (!O)
                        break;
                    }
                  else
                    return ce.errors = [
                      {
                        instancePath: t + "/headers",
                        schemaPath: "#/definitions/PHPRequestHeaders/type",
                        keyword: "type",
                        params: { type: "object" },
                        message: "must be object"
                      }
                    ], !1;
                var d = A === e;
              } else
                var d = !0;
              if (d)
                if (r.body !== void 0) {
                  let P = r.body;
                  const A = e, F = e;
                  let z = !1;
                  const l = e;
                  if (typeof P != "string") {
                    const _ = {
                      instancePath: t + "/body",
                      schemaPath: "#/properties/body/anyOf/0/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    };
                    i === null ? i = [_] : i.push(_), e++;
                  }
                  var B = l === e;
                  if (z = z || B, !z) {
                    const _ = e;
                    if (e === _)
                      if (P && typeof P == "object" && !Array.isArray(P)) {
                        let g;
                        if (P.BYTES_PER_ELEMENT === void 0 && (g = "BYTES_PER_ELEMENT") || P.buffer === void 0 && (g = "buffer") || P.byteLength === void 0 && (g = "byteLength") || P.byteOffset === void 0 && (g = "byteOffset") || P.length === void 0 && (g = "length")) {
                          const m = {
                            instancePath: t + "/body",
                            schemaPath: "#/properties/body/anyOf/1/required",
                            keyword: "required",
                            params: {
                              missingProperty: g
                            },
                            message: "must have required property '" + g + "'"
                          };
                          i === null ? i = [m] : i.push(m), e++;
                        } else {
                          const m = e;
                          for (const y in P)
                            if (!(y === "BYTES_PER_ELEMENT" || y === "buffer" || y === "byteLength" || y === "byteOffset" || y === "length")) {
                              let h = P[y];
                              const w = e;
                              if (!(typeof h == "number" && isFinite(
                                h
                              ))) {
                                const L = {
                                  instancePath: t + "/body/" + y.replace(
                                    /~/g,
                                    "~0"
                                  ).replace(
                                    /\//g,
                                    "~1"
                                  ),
                                  schemaPath: "#/properties/body/anyOf/1/additionalProperties/type",
                                  keyword: "type",
                                  params: {
                                    type: "number"
                                  },
                                  message: "must be number"
                                };
                                i === null ? i = [
                                  L
                                ] : i.push(
                                  L
                                ), e++;
                              }
                              var I = w === e;
                              if (!I)
                                break;
                            }
                          if (m === e) {
                            if (P.BYTES_PER_ELEMENT !== void 0) {
                              let y = P.BYTES_PER_ELEMENT;
                              const h = e;
                              if (!(typeof y == "number" && isFinite(
                                y
                              ))) {
                                const w = {
                                  instancePath: t + "/body/BYTES_PER_ELEMENT",
                                  schemaPath: "#/properties/body/anyOf/1/properties/BYTES_PER_ELEMENT/type",
                                  keyword: "type",
                                  params: {
                                    type: "number"
                                  },
                                  message: "must be number"
                                };
                                i === null ? i = [
                                  w
                                ] : i.push(
                                  w
                                ), e++;
                              }
                              var v = h === e;
                            } else
                              var v = !0;
                            if (v) {
                              if (P.buffer !== void 0) {
                                let y = P.buffer;
                                const h = e;
                                if (e === h)
                                  if (y && typeof y == "object" && !Array.isArray(
                                    y
                                  )) {
                                    let L;
                                    if (y.byteLength === void 0 && (L = "byteLength")) {
                                      const T = {
                                        instancePath: t + "/body/buffer",
                                        schemaPath: "#/properties/body/anyOf/1/properties/buffer/required",
                                        keyword: "required",
                                        params: {
                                          missingProperty: L
                                        },
                                        message: "must have required property '" + L + "'"
                                      };
                                      i === null ? i = [
                                        T
                                      ] : i.push(
                                        T
                                      ), e++;
                                    } else {
                                      const T = e;
                                      for (const x in y)
                                        if (x !== "byteLength") {
                                          const j = {
                                            instancePath: t + "/body/buffer",
                                            schemaPath: "#/properties/body/anyOf/1/properties/buffer/additionalProperties",
                                            keyword: "additionalProperties",
                                            params: {
                                              additionalProperty: x
                                            },
                                            message: "must NOT have additional properties"
                                          };
                                          i === null ? i = [
                                            j
                                          ] : i.push(
                                            j
                                          ), e++;
                                          break;
                                        }
                                      if (T === e && y.byteLength !== void 0) {
                                        let x = y.byteLength;
                                        if (!(typeof x == "number" && isFinite(
                                          x
                                        ))) {
                                          const j = {
                                            instancePath: t + "/body/buffer/byteLength",
                                            schemaPath: "#/properties/body/anyOf/1/properties/buffer/properties/byteLength/type",
                                            keyword: "type",
                                            params: {
                                              type: "number"
                                            },
                                            message: "must be number"
                                          };
                                          i === null ? i = [
                                            j
                                          ] : i.push(
                                            j
                                          ), e++;
                                        }
                                      }
                                    }
                                  } else {
                                    const L = {
                                      instancePath: t + "/body/buffer",
                                      schemaPath: "#/properties/body/anyOf/1/properties/buffer/type",
                                      keyword: "type",
                                      params: {
                                        type: "object"
                                      },
                                      message: "must be object"
                                    };
                                    i === null ? i = [
                                      L
                                    ] : i.push(
                                      L
                                    ), e++;
                                  }
                                var v = h === e;
                              } else
                                var v = !0;
                              if (v) {
                                if (P.byteLength !== void 0) {
                                  let y = P.byteLength;
                                  const h = e;
                                  if (!(typeof y == "number" && isFinite(
                                    y
                                  ))) {
                                    const L = {
                                      instancePath: t + "/body/byteLength",
                                      schemaPath: "#/properties/body/anyOf/1/properties/byteLength/type",
                                      keyword: "type",
                                      params: {
                                        type: "number"
                                      },
                                      message: "must be number"
                                    };
                                    i === null ? i = [
                                      L
                                    ] : i.push(
                                      L
                                    ), e++;
                                  }
                                  var v = h === e;
                                } else
                                  var v = !0;
                                if (v) {
                                  if (P.byteOffset !== void 0) {
                                    let y = P.byteOffset;
                                    const h = e;
                                    if (!(typeof y == "number" && isFinite(
                                      y
                                    ))) {
                                      const L = {
                                        instancePath: t + "/body/byteOffset",
                                        schemaPath: "#/properties/body/anyOf/1/properties/byteOffset/type",
                                        keyword: "type",
                                        params: {
                                          type: "number"
                                        },
                                        message: "must be number"
                                      };
                                      i === null ? i = [
                                        L
                                      ] : i.push(
                                        L
                                      ), e++;
                                    }
                                    var v = h === e;
                                  } else
                                    var v = !0;
                                  if (v)
                                    if (P.length !== void 0) {
                                      let y = P.length;
                                      const h = e;
                                      if (!(typeof y == "number" && isFinite(
                                        y
                                      ))) {
                                        const L = {
                                          instancePath: t + "/body/length",
                                          schemaPath: "#/properties/body/anyOf/1/properties/length/type",
                                          keyword: "type",
                                          params: {
                                            type: "number"
                                          },
                                          message: "must be number"
                                        };
                                        i === null ? i = [
                                          L
                                        ] : i.push(
                                          L
                                        ), e++;
                                      }
                                      var v = h === e;
                                    } else
                                      var v = !0;
                                }
                              }
                            }
                          }
                        }
                      } else {
                        const g = {
                          instancePath: t + "/body",
                          schemaPath: "#/properties/body/anyOf/1/type",
                          keyword: "type",
                          params: { type: "object" },
                          message: "must be object"
                        };
                        i === null ? i = [g] : i.push(g), e++;
                      }
                    var B = _ === e;
                    if (z = z || B, !z) {
                      const g = e;
                      if (e === g)
                        if (P && typeof P == "object" && !Array.isArray(P))
                          for (const y in P) {
                            let h = P[y];
                            const w = e, L = e;
                            let T = !1;
                            const x = e;
                            if (typeof h != "string") {
                              const j = {
                                instancePath: t + "/body/" + y.replace(
                                  /~/g,
                                  "~0"
                                ).replace(
                                  /\//g,
                                  "~1"
                                ),
                                schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/0/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              };
                              i === null ? i = [
                                j
                              ] : i.push(
                                j
                              ), e++;
                            }
                            var R = x === e;
                            if (T = T || R, !T) {
                              const j = e;
                              if (e === j)
                                if (h && typeof h == "object" && !Array.isArray(
                                  h
                                )) {
                                  let ee;
                                  if (h.BYTES_PER_ELEMENT === void 0 && (ee = "BYTES_PER_ELEMENT") || h.buffer === void 0 && (ee = "buffer") || h.byteLength === void 0 && (ee = "byteLength") || h.byteOffset === void 0 && (ee = "byteOffset") || h.length === void 0 && (ee = "length")) {
                                    const X = {
                                      instancePath: t + "/body/" + y.replace(
                                        /~/g,
                                        "~0"
                                      ).replace(
                                        /\//g,
                                        "~1"
                                      ),
                                      schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/required",
                                      keyword: "required",
                                      params: {
                                        missingProperty: ee
                                      },
                                      message: "must have required property '" + ee + "'"
                                    };
                                    i === null ? i = [
                                      X
                                    ] : i.push(
                                      X
                                    ), e++;
                                  } else {
                                    const X = e;
                                    for (const N in h)
                                      if (!(N === "BYTES_PER_ELEMENT" || N === "buffer" || N === "byteLength" || N === "byteOffset" || N === "length")) {
                                        let Q = h[N];
                                        const C = e;
                                        if (!(typeof Q == "number" && isFinite(
                                          Q
                                        ))) {
                                          const Y = {
                                            instancePath: t + "/body/" + y.replace(
                                              /~/g,
                                              "~0"
                                            ).replace(
                                              /\//g,
                                              "~1"
                                            ) + "/" + N.replace(
                                              /~/g,
                                              "~0"
                                            ).replace(
                                              /\//g,
                                              "~1"
                                            ),
                                            schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/additionalProperties/type",
                                            keyword: "type",
                                            params: {
                                              type: "number"
                                            },
                                            message: "must be number"
                                          };
                                          i === null ? i = [
                                            Y
                                          ] : i.push(
                                            Y
                                          ), e++;
                                        }
                                        var M = C === e;
                                        if (!M)
                                          break;
                                      }
                                    if (X === e) {
                                      if (h.BYTES_PER_ELEMENT !== void 0) {
                                        let N = h.BYTES_PER_ELEMENT;
                                        const Q = e;
                                        if (!(typeof N == "number" && isFinite(
                                          N
                                        ))) {
                                          const C = {
                                            instancePath: t + "/body/" + y.replace(
                                              /~/g,
                                              "~0"
                                            ).replace(
                                              /\//g,
                                              "~1"
                                            ) + "/BYTES_PER_ELEMENT",
                                            schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/BYTES_PER_ELEMENT/type",
                                            keyword: "type",
                                            params: {
                                              type: "number"
                                            },
                                            message: "must be number"
                                          };
                                          i === null ? i = [
                                            C
                                          ] : i.push(
                                            C
                                          ), e++;
                                        }
                                        var U = Q === e;
                                      } else
                                        var U = !0;
                                      if (U) {
                                        if (h.buffer !== void 0) {
                                          let N = h.buffer;
                                          const Q = e;
                                          if (e === Q)
                                            if (N && typeof N == "object" && !Array.isArray(
                                              N
                                            )) {
                                              let Y;
                                              if (N.byteLength === void 0 && (Y = "byteLength")) {
                                                const J = {
                                                  instancePath: t + "/body/" + y.replace(
                                                    /~/g,
                                                    "~0"
                                                  ).replace(
                                                    /\//g,
                                                    "~1"
                                                  ) + "/buffer",
                                                  schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/buffer/required",
                                                  keyword: "required",
                                                  params: {
                                                    missingProperty: Y
                                                  },
                                                  message: "must have required property '" + Y + "'"
                                                };
                                                i === null ? i = [
                                                  J
                                                ] : i.push(
                                                  J
                                                ), e++;
                                              } else {
                                                const J = e;
                                                for (const ae in N)
                                                  if (ae !== "byteLength") {
                                                    const pe = {
                                                      instancePath: t + "/body/" + y.replace(
                                                        /~/g,
                                                        "~0"
                                                      ).replace(
                                                        /\//g,
                                                        "~1"
                                                      ) + "/buffer",
                                                      schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/buffer/additionalProperties",
                                                      keyword: "additionalProperties",
                                                      params: {
                                                        additionalProperty: ae
                                                      },
                                                      message: "must NOT have additional properties"
                                                    };
                                                    i === null ? i = [
                                                      pe
                                                    ] : i.push(
                                                      pe
                                                    ), e++;
                                                    break;
                                                  }
                                                if (J === e && N.byteLength !== void 0) {
                                                  let ae = N.byteLength;
                                                  if (!(typeof ae == "number" && isFinite(
                                                    ae
                                                  ))) {
                                                    const pe = {
                                                      instancePath: t + "/body/" + y.replace(
                                                        /~/g,
                                                        "~0"
                                                      ).replace(
                                                        /\//g,
                                                        "~1"
                                                      ) + "/buffer/byteLength",
                                                      schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/buffer/properties/byteLength/type",
                                                      keyword: "type",
                                                      params: {
                                                        type: "number"
                                                      },
                                                      message: "must be number"
                                                    };
                                                    i === null ? i = [
                                                      pe
                                                    ] : i.push(
                                                      pe
                                                    ), e++;
                                                  }
                                                }
                                              }
                                            } else {
                                              const Y = {
                                                instancePath: t + "/body/" + y.replace(
                                                  /~/g,
                                                  "~0"
                                                ).replace(
                                                  /\//g,
                                                  "~1"
                                                ) + "/buffer",
                                                schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/buffer/type",
                                                keyword: "type",
                                                params: {
                                                  type: "object"
                                                },
                                                message: "must be object"
                                              };
                                              i === null ? i = [
                                                Y
                                              ] : i.push(
                                                Y
                                              ), e++;
                                            }
                                          var U = Q === e;
                                        } else
                                          var U = !0;
                                        if (U) {
                                          if (h.byteLength !== void 0) {
                                            let N = h.byteLength;
                                            const Q = e;
                                            if (!(typeof N == "number" && isFinite(
                                              N
                                            ))) {
                                              const Y = {
                                                instancePath: t + "/body/" + y.replace(
                                                  /~/g,
                                                  "~0"
                                                ).replace(
                                                  /\//g,
                                                  "~1"
                                                ) + "/byteLength",
                                                schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/byteLength/type",
                                                keyword: "type",
                                                params: {
                                                  type: "number"
                                                },
                                                message: "must be number"
                                              };
                                              i === null ? i = [
                                                Y
                                              ] : i.push(
                                                Y
                                              ), e++;
                                            }
                                            var U = Q === e;
                                          } else
                                            var U = !0;
                                          if (U) {
                                            if (h.byteOffset !== void 0) {
                                              let N = h.byteOffset;
                                              const Q = e;
                                              if (!(typeof N == "number" && isFinite(
                                                N
                                              ))) {
                                                const Y = {
                                                  instancePath: t + "/body/" + y.replace(
                                                    /~/g,
                                                    "~0"
                                                  ).replace(
                                                    /\//g,
                                                    "~1"
                                                  ) + "/byteOffset",
                                                  schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/byteOffset/type",
                                                  keyword: "type",
                                                  params: {
                                                    type: "number"
                                                  },
                                                  message: "must be number"
                                                };
                                                i === null ? i = [
                                                  Y
                                                ] : i.push(
                                                  Y
                                                ), e++;
                                              }
                                              var U = Q === e;
                                            } else
                                              var U = !0;
                                            if (U)
                                              if (h.length !== void 0) {
                                                let N = h.length;
                                                const Q = e;
                                                if (!(typeof N == "number" && isFinite(
                                                  N
                                                ))) {
                                                  const Y = {
                                                    instancePath: t + "/body/" + y.replace(
                                                      /~/g,
                                                      "~0"
                                                    ).replace(
                                                      /\//g,
                                                      "~1"
                                                    ) + "/length",
                                                    schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/properties/length/type",
                                                    keyword: "type",
                                                    params: {
                                                      type: "number"
                                                    },
                                                    message: "must be number"
                                                  };
                                                  i === null ? i = [
                                                    Y
                                                  ] : i.push(
                                                    Y
                                                  ), e++;
                                                }
                                                var U = Q === e;
                                              } else
                                                var U = !0;
                                          }
                                        }
                                      }
                                    }
                                  }
                                } else {
                                  const ee = {
                                    instancePath: t + "/body/" + y.replace(
                                      /~/g,
                                      "~0"
                                    ).replace(
                                      /\//g,
                                      "~1"
                                    ),
                                    schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/1/type",
                                    keyword: "type",
                                    params: {
                                      type: "object"
                                    },
                                    message: "must be object"
                                  };
                                  i === null ? i = [
                                    ee
                                  ] : i.push(
                                    ee
                                  ), e++;
                                }
                              var R = j === e;
                              if (T = T || R, !T) {
                                const ee = e;
                                if (e === ee)
                                  if (h && typeof h == "object" && !Array.isArray(
                                    h
                                  )) {
                                    let N;
                                    if (h.lastModified === void 0 && (N = "lastModified") || h.name === void 0 && (N = "name") || h.size === void 0 && (N = "size") || h.type === void 0 && (N = "type") || h.webkitRelativePath === void 0 && (N = "webkitRelativePath")) {
                                      const Q = {
                                        instancePath: t + "/body/" + y.replace(
                                          /~/g,
                                          "~0"
                                        ).replace(
                                          /\//g,
                                          "~1"
                                        ),
                                        schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/required",
                                        keyword: "required",
                                        params: {
                                          missingProperty: N
                                        },
                                        message: "must have required property '" + N + "'"
                                      };
                                      i === null ? i = [
                                        Q
                                      ] : i.push(
                                        Q
                                      ), e++;
                                    } else {
                                      const Q = e;
                                      for (const C in h)
                                        if (!(C === "size" || C === "type" || C === "lastModified" || C === "name" || C === "webkitRelativePath")) {
                                          const Y = {
                                            instancePath: t + "/body/" + y.replace(
                                              /~/g,
                                              "~0"
                                            ).replace(
                                              /\//g,
                                              "~1"
                                            ),
                                            schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/additionalProperties",
                                            keyword: "additionalProperties",
                                            params: {
                                              additionalProperty: C
                                            },
                                            message: "must NOT have additional properties"
                                          };
                                          i === null ? i = [
                                            Y
                                          ] : i.push(
                                            Y
                                          ), e++;
                                          break;
                                        }
                                      if (Q === e) {
                                        if (h.size !== void 0) {
                                          let C = h.size;
                                          const Y = e;
                                          if (!(typeof C == "number" && isFinite(
                                            C
                                          ))) {
                                            const J = {
                                              instancePath: t + "/body/" + y.replace(
                                                /~/g,
                                                "~0"
                                              ).replace(
                                                /\//g,
                                                "~1"
                                              ) + "/size",
                                              schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/properties/size/type",
                                              keyword: "type",
                                              params: {
                                                type: "number"
                                              },
                                              message: "must be number"
                                            };
                                            i === null ? i = [
                                              J
                                            ] : i.push(
                                              J
                                            ), e++;
                                          }
                                          var b = Y === e;
                                        } else
                                          var b = !0;
                                        if (b) {
                                          if (h.type !== void 0) {
                                            const C = e;
                                            if (typeof h.type != "string") {
                                              const J = {
                                                instancePath: t + "/body/" + y.replace(
                                                  /~/g,
                                                  "~0"
                                                ).replace(
                                                  /\//g,
                                                  "~1"
                                                ) + "/type",
                                                schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/properties/type/type",
                                                keyword: "type",
                                                params: {
                                                  type: "string"
                                                },
                                                message: "must be string"
                                              };
                                              i === null ? i = [
                                                J
                                              ] : i.push(
                                                J
                                              ), e++;
                                            }
                                            var b = C === e;
                                          } else
                                            var b = !0;
                                          if (b) {
                                            if (h.lastModified !== void 0) {
                                              let C = h.lastModified;
                                              const Y = e;
                                              if (!(typeof C == "number" && isFinite(
                                                C
                                              ))) {
                                                const ae = {
                                                  instancePath: t + "/body/" + y.replace(
                                                    /~/g,
                                                    "~0"
                                                  ).replace(
                                                    /\//g,
                                                    "~1"
                                                  ) + "/lastModified",
                                                  schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/properties/lastModified/type",
                                                  keyword: "type",
                                                  params: {
                                                    type: "number"
                                                  },
                                                  message: "must be number"
                                                };
                                                i === null ? i = [
                                                  ae
                                                ] : i.push(
                                                  ae
                                                ), e++;
                                              }
                                              var b = Y === e;
                                            } else
                                              var b = !0;
                                            if (b) {
                                              if (h.name !== void 0) {
                                                const C = e;
                                                if (typeof h.name != "string") {
                                                  const J = {
                                                    instancePath: t + "/body/" + y.replace(
                                                      /~/g,
                                                      "~0"
                                                    ).replace(
                                                      /\//g,
                                                      "~1"
                                                    ) + "/name",
                                                    schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/properties/name/type",
                                                    keyword: "type",
                                                    params: {
                                                      type: "string"
                                                    },
                                                    message: "must be string"
                                                  };
                                                  i === null ? i = [
                                                    J
                                                  ] : i.push(
                                                    J
                                                  ), e++;
                                                }
                                                var b = C === e;
                                              } else
                                                var b = !0;
                                              if (b)
                                                if (h.webkitRelativePath !== void 0) {
                                                  const C = e;
                                                  if (typeof h.webkitRelativePath != "string") {
                                                    const J = {
                                                      instancePath: t + "/body/" + y.replace(
                                                        /~/g,
                                                        "~0"
                                                      ).replace(
                                                        /\//g,
                                                        "~1"
                                                      ) + "/webkitRelativePath",
                                                      schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/properties/webkitRelativePath/type",
                                                      keyword: "type",
                                                      params: {
                                                        type: "string"
                                                      },
                                                      message: "must be string"
                                                    };
                                                    i === null ? i = [
                                                      J
                                                    ] : i.push(
                                                      J
                                                    ), e++;
                                                  }
                                                  var b = C === e;
                                                } else
                                                  var b = !0;
                                            }
                                          }
                                        }
                                      }
                                    }
                                  } else {
                                    const N = {
                                      instancePath: t + "/body/" + y.replace(
                                        /~/g,
                                        "~0"
                                      ).replace(
                                        /\//g,
                                        "~1"
                                      ),
                                      schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf/2/type",
                                      keyword: "type",
                                      params: {
                                        type: "object"
                                      },
                                      message: "must be object"
                                    };
                                    i === null ? i = [
                                      N
                                    ] : i.push(
                                      N
                                    ), e++;
                                  }
                                var R = ee === e;
                                T = T || R;
                              }
                            }
                            if (T)
                              e = L, i !== null && (L ? i.length = L : i = null);
                            else {
                              const j = {
                                instancePath: t + "/body/" + y.replace(
                                  /~/g,
                                  "~0"
                                ).replace(
                                  /\//g,
                                  "~1"
                                ),
                                schemaPath: "#/properties/body/anyOf/2/additionalProperties/anyOf",
                                keyword: "anyOf",
                                params: {},
                                message: "must match a schema in anyOf"
                              };
                              i === null ? i = [
                                j
                              ] : i.push(
                                j
                              ), e++;
                            }
                            var D = w === e;
                            if (!D)
                              break;
                          }
                        else {
                          const y = {
                            instancePath: t + "/body",
                            schemaPath: "#/properties/body/anyOf/2/type",
                            keyword: "type",
                            params: {
                              type: "object"
                            },
                            message: "must be object"
                          };
                          i === null ? i = [y] : i.push(y), e++;
                        }
                      var B = g === e;
                      z = z || B;
                    }
                  }
                  if (z)
                    e = F, i !== null && (F ? i.length = F : i = null);
                  else {
                    const _ = {
                      instancePath: t + "/body",
                      schemaPath: "#/properties/body/anyOf",
                      keyword: "anyOf",
                      params: {},
                      message: "must match a schema in anyOf"
                    };
                    return i === null ? i = [_] : i.push(_), e++, ce.errors = i, !1;
                  }
                  var d = A === e;
                } else
                  var d = !0;
            }
          }
        }
      }
    } else
      return ce.errors = [
        {
          instancePath: t,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
      ], !1;
  return ce.errors = i, e === 0;
}
const bt = {
  type: "object",
  properties: {
    relativeUri: {
      type: "string",
      description: "Request path following the domain:port part."
    },
    scriptPath: {
      type: "string",
      description: "Path of the .php file to execute."
    },
    protocol: { type: "string", description: "Request protocol." },
    method: {
      $ref: "#/definitions/HTTPMethod",
      description: "Request method. Default: `GET`."
    },
    headers: {
      $ref: "#/definitions/PHPRequestHeaders",
      description: "Request headers."
    },
    body: {
      anyOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            BYTES_PER_ELEMENT: { type: "number" },
            buffer: {
              type: "object",
              properties: { byteLength: { type: "number" } },
              required: ["byteLength"],
              additionalProperties: !1
            },
            byteLength: { type: "number" },
            byteOffset: { type: "number" },
            length: { type: "number" }
          },
          required: [
            "BYTES_PER_ELEMENT",
            "buffer",
            "byteLength",
            "byteOffset",
            "length"
          ],
          additionalProperties: { type: "number" }
        }
      ],
      description: "Request body."
    },
    env: {
      type: "object",
      additionalProperties: { type: "string" },
      description: "Environment variables to set for this run."
    },
    $_SERVER: {
      type: "object",
      additionalProperties: { type: "string" },
      description: "$_SERVER entries to set for this run."
    },
    code: {
      type: "string",
      description: "The code snippet to eval instead of a php file."
    }
  },
  additionalProperties: !1
};
function ie(r, { instancePath: t = "", parentData: f, parentDataProperty: c, rootData: u = r } = {}) {
  let i = null, e = 0;
  if (e === 0)
    if (r && typeof r == "object" && !Array.isArray(r)) {
      const U = e;
      for (const b in r)
        if (!br.call(bt.properties, b))
          return ie.errors = [
            {
              instancePath: t,
              schemaPath: "#/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: b },
              message: "must NOT have additional properties"
            }
          ], !1;
      if (U === e) {
        if (r.relativeUri !== void 0) {
          const b = e;
          if (typeof r.relativeUri != "string")
            return ie.errors = [
              {
                instancePath: t + "/relativeUri",
                schemaPath: "#/properties/relativeUri/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
            ], !1;
          var d = b === e;
        } else
          var d = !0;
        if (d) {
          if (r.scriptPath !== void 0) {
            const b = e;
            if (typeof r.scriptPath != "string")
              return ie.errors = [
                {
                  instancePath: t + "/scriptPath",
                  schemaPath: "#/properties/scriptPath/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
              ], !1;
            var d = b === e;
          } else
            var d = !0;
          if (d) {
            if (r.protocol !== void 0) {
              const b = e;
              if (typeof r.protocol != "string")
                return ie.errors = [
                  {
                    instancePath: t + "/protocol",
                    schemaPath: "#/properties/protocol/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                ], !1;
              var d = b === e;
            } else
              var d = !0;
            if (d) {
              if (r.method !== void 0) {
                let b = r.method;
                const D = e;
                if (typeof b != "string")
                  return ie.errors = [
                    {
                      instancePath: t + "/method",
                      schemaPath: "#/definitions/HTTPMethod/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                  ], !1;
                if (!(b === "GET" || b === "POST" || b === "HEAD" || b === "OPTIONS" || b === "PATCH" || b === "PUT" || b === "DELETE"))
                  return ie.errors = [
                    {
                      instancePath: t + "/method",
                      schemaPath: "#/definitions/HTTPMethod/enum",
                      keyword: "enum",
                      params: {
                        allowedValues: wr.enum
                      },
                      message: "must be equal to one of the allowed values"
                    }
                  ], !1;
                var d = D === e;
              } else
                var d = !0;
              if (d) {
                if (r.headers !== void 0) {
                  let b = r.headers;
                  const D = e;
                  if (e === e)
                    if (b && typeof b == "object" && !Array.isArray(b))
                      for (const P in b) {
                        const A = e;
                        if (typeof b[P] != "string")
                          return ie.errors = [
                            {
                              instancePath: t + "/headers/" + P.replace(
                                /~/g,
                                "~0"
                              ).replace(
                                /\//g,
                                "~1"
                              ),
                              schemaPath: "#/definitions/PHPRequestHeaders/additionalProperties/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        var O = A === e;
                        if (!O)
                          break;
                      }
                    else
                      return ie.errors = [
                        {
                          instancePath: t + "/headers",
                          schemaPath: "#/definitions/PHPRequestHeaders/type",
                          keyword: "type",
                          params: { type: "object" },
                          message: "must be object"
                        }
                      ], !1;
                  var d = D === e;
                } else
                  var d = !0;
                if (d) {
                  if (r.body !== void 0) {
                    let b = r.body;
                    const D = e, te = e;
                    let H = !1;
                    const P = e;
                    if (typeof b != "string") {
                      const F = {
                        instancePath: t + "/body",
                        schemaPath: "#/properties/body/anyOf/0/type",
                        keyword: "type",
                        params: { type: "string" },
                        message: "must be string"
                      };
                      i === null ? i = [F] : i.push(F), e++;
                    }
                    var B = P === e;
                    if (H = H || B, !H) {
                      const F = e;
                      if (e === F)
                        if (b && typeof b == "object" && !Array.isArray(b)) {
                          let l;
                          if (b.BYTES_PER_ELEMENT === void 0 && (l = "BYTES_PER_ELEMENT") || b.buffer === void 0 && (l = "buffer") || b.byteLength === void 0 && (l = "byteLength") || b.byteOffset === void 0 && (l = "byteOffset") || b.length === void 0 && (l = "length")) {
                            const E = {
                              instancePath: t + "/body",
                              schemaPath: "#/properties/body/anyOf/1/required",
                              keyword: "required",
                              params: {
                                missingProperty: l
                              },
                              message: "must have required property '" + l + "'"
                            };
                            i === null ? i = [E] : i.push(E), e++;
                          } else {
                            const E = e;
                            for (const _ in b)
                              if (!(_ === "BYTES_PER_ELEMENT" || _ === "buffer" || _ === "byteLength" || _ === "byteOffset" || _ === "length")) {
                                let k = b[_];
                                const g = e;
                                if (!(typeof k == "number" && isFinite(
                                  k
                                ))) {
                                  const m = {
                                    instancePath: t + "/body/" + _.replace(
                                      /~/g,
                                      "~0"
                                    ).replace(
                                      /\//g,
                                      "~1"
                                    ),
                                    schemaPath: "#/properties/body/anyOf/1/additionalProperties/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  i === null ? i = [
                                    m
                                  ] : i.push(
                                    m
                                  ), e++;
                                }
                                var I = g === e;
                                if (!I)
                                  break;
                              }
                            if (E === e) {
                              if (b.BYTES_PER_ELEMENT !== void 0) {
                                let _ = b.BYTES_PER_ELEMENT;
                                const k = e;
                                if (!(typeof _ == "number" && isFinite(
                                  _
                                ))) {
                                  const g = {
                                    instancePath: t + "/body/BYTES_PER_ELEMENT",
                                    schemaPath: "#/properties/body/anyOf/1/properties/BYTES_PER_ELEMENT/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  i === null ? i = [
                                    g
                                  ] : i.push(
                                    g
                                  ), e++;
                                }
                                var v = k === e;
                              } else
                                var v = !0;
                              if (v) {
                                if (b.buffer !== void 0) {
                                  let _ = b.buffer;
                                  const k = e;
                                  if (e === k)
                                    if (_ && typeof _ == "object" && !Array.isArray(
                                      _
                                    )) {
                                      let m;
                                      if (_.byteLength === void 0 && (m = "byteLength")) {
                                        const y = {
                                          instancePath: t + "/body/buffer",
                                          schemaPath: "#/properties/body/anyOf/1/properties/buffer/required",
                                          keyword: "required",
                                          params: {
                                            missingProperty: m
                                          },
                                          message: "must have required property '" + m + "'"
                                        };
                                        i === null ? i = [
                                          y
                                        ] : i.push(
                                          y
                                        ), e++;
                                      } else {
                                        const y = e;
                                        for (const h in _)
                                          if (h !== "byteLength") {
                                            const w = {
                                              instancePath: t + "/body/buffer",
                                              schemaPath: "#/properties/body/anyOf/1/properties/buffer/additionalProperties",
                                              keyword: "additionalProperties",
                                              params: {
                                                additionalProperty: h
                                              },
                                              message: "must NOT have additional properties"
                                            };
                                            i === null ? i = [
                                              w
                                            ] : i.push(
                                              w
                                            ), e++;
                                            break;
                                          }
                                        if (y === e && _.byteLength !== void 0) {
                                          let h = _.byteLength;
                                          if (!(typeof h == "number" && isFinite(
                                            h
                                          ))) {
                                            const w = {
                                              instancePath: t + "/body/buffer/byteLength",
                                              schemaPath: "#/properties/body/anyOf/1/properties/buffer/properties/byteLength/type",
                                              keyword: "type",
                                              params: {
                                                type: "number"
                                              },
                                              message: "must be number"
                                            };
                                            i === null ? i = [
                                              w
                                            ] : i.push(
                                              w
                                            ), e++;
                                          }
                                        }
                                      }
                                    } else {
                                      const m = {
                                        instancePath: t + "/body/buffer",
                                        schemaPath: "#/properties/body/anyOf/1/properties/buffer/type",
                                        keyword: "type",
                                        params: {
                                          type: "object"
                                        },
                                        message: "must be object"
                                      };
                                      i === null ? i = [
                                        m
                                      ] : i.push(
                                        m
                                      ), e++;
                                    }
                                  var v = k === e;
                                } else
                                  var v = !0;
                                if (v) {
                                  if (b.byteLength !== void 0) {
                                    let _ = b.byteLength;
                                    const k = e;
                                    if (!(typeof _ == "number" && isFinite(
                                      _
                                    ))) {
                                      const m = {
                                        instancePath: t + "/body/byteLength",
                                        schemaPath: "#/properties/body/anyOf/1/properties/byteLength/type",
                                        keyword: "type",
                                        params: {
                                          type: "number"
                                        },
                                        message: "must be number"
                                      };
                                      i === null ? i = [
                                        m
                                      ] : i.push(
                                        m
                                      ), e++;
                                    }
                                    var v = k === e;
                                  } else
                                    var v = !0;
                                  if (v) {
                                    if (b.byteOffset !== void 0) {
                                      let _ = b.byteOffset;
                                      const k = e;
                                      if (!(typeof _ == "number" && isFinite(
                                        _
                                      ))) {
                                        const m = {
                                          instancePath: t + "/body/byteOffset",
                                          schemaPath: "#/properties/body/anyOf/1/properties/byteOffset/type",
                                          keyword: "type",
                                          params: {
                                            type: "number"
                                          },
                                          message: "must be number"
                                        };
                                        i === null ? i = [
                                          m
                                        ] : i.push(
                                          m
                                        ), e++;
                                      }
                                      var v = k === e;
                                    } else
                                      var v = !0;
                                    if (v)
                                      if (b.length !== void 0) {
                                        let _ = b.length;
                                        const k = e;
                                        if (!(typeof _ == "number" && isFinite(
                                          _
                                        ))) {
                                          const m = {
                                            instancePath: t + "/body/length",
                                            schemaPath: "#/properties/body/anyOf/1/properties/length/type",
                                            keyword: "type",
                                            params: {
                                              type: "number"
                                            },
                                            message: "must be number"
                                          };
                                          i === null ? i = [
                                            m
                                          ] : i.push(
                                            m
                                          ), e++;
                                        }
                                        var v = k === e;
                                      } else
                                        var v = !0;
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          const l = {
                            instancePath: t + "/body",
                            schemaPath: "#/properties/body/anyOf/1/type",
                            keyword: "type",
                            params: {
                              type: "object"
                            },
                            message: "must be object"
                          };
                          i === null ? i = [l] : i.push(l), e++;
                        }
                      var B = F === e;
                      H = H || B;
                    }
                    if (H)
                      e = te, i !== null && (te ? i.length = te : i = null);
                    else {
                      const F = {
                        instancePath: t + "/body",
                        schemaPath: "#/properties/body/anyOf",
                        keyword: "anyOf",
                        params: {},
                        message: "must match a schema in anyOf"
                      };
                      return i === null ? i = [F] : i.push(F), e++, ie.errors = i, !1;
                    }
                    var d = D === e;
                  } else
                    var d = !0;
                  if (d) {
                    if (r.env !== void 0) {
                      let b = r.env;
                      const D = e;
                      if (e === D)
                        if (b && typeof b == "object" && !Array.isArray(b))
                          for (const H in b) {
                            const P = e;
                            if (typeof b[H] != "string")
                              return ie.errors = [
                                {
                                  instancePath: t + "/env/" + H.replace(
                                    /~/g,
                                    "~0"
                                  ).replace(
                                    /\//g,
                                    "~1"
                                  ),
                                  schemaPath: "#/properties/env/additionalProperties/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var R = P === e;
                            if (!R)
                              break;
                          }
                        else
                          return ie.errors = [
                            {
                              instancePath: t + "/env",
                              schemaPath: "#/properties/env/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var d = D === e;
                    } else
                      var d = !0;
                    if (d) {
                      if (r.$_SERVER !== void 0) {
                        let b = r.$_SERVER;
                        const D = e;
                        if (e === D)
                          if (b && typeof b == "object" && !Array.isArray(b))
                            for (const H in b) {
                              const P = e;
                              if (typeof b[H] != "string")
                                return ie.errors = [
                                  {
                                    instancePath: t + "/$_SERVER/" + H.replace(
                                      /~/g,
                                      "~0"
                                    ).replace(
                                      /\//g,
                                      "~1"
                                    ),
                                    schemaPath: "#/properties/%24_SERVER/additionalProperties/type",
                                    keyword: "type",
                                    params: {
                                      type: "string"
                                    },
                                    message: "must be string"
                                  }
                                ], !1;
                              var M = P === e;
                              if (!M)
                                break;
                            }
                          else
                            return ie.errors = [
                              {
                                instancePath: t + "/$_SERVER",
                                schemaPath: "#/properties/%24_SERVER/type",
                                keyword: "type",
                                params: {
                                  type: "object"
                                },
                                message: "must be object"
                              }
                            ], !1;
                        var d = D === e;
                      } else
                        var d = !0;
                      if (d)
                        if (r.code !== void 0) {
                          const b = e;
                          if (typeof r.code != "string")
                            return ie.errors = [
                              {
                                instancePath: t + "/code",
                                schemaPath: "#/properties/code/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var d = b === e;
                        } else
                          var d = !0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else
      return ie.errors = [
        {
          instancePath: t,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
      ], !1;
  return ie.errors = i, e === 0;
}
function o(r, { instancePath: t = "", parentData: f, parentDataProperty: c, rootData: u = r } = {}) {
  let i = null, e = 0;
  if (e === 0)
    if (r && typeof r == "object" && !Array.isArray(r)) {
      let Ye;
      if (r.step === void 0 && (Ye = "step"))
        return o.errors = [
          {
            instancePath: t,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: Ye },
            message: "must have required property '" + Ye + "'"
          }
        ], !1;
      {
        const G = r.step;
        if (typeof G == "string")
          if (G === "activatePlugin") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.pluginPath === void 0 && (p = "pluginPath") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/0/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "pluginPath" || s === "pluginName"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/0/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/0/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/0/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var d = $ === e;
                            } else
                              var d = !0;
                            if (d)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/0/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var d = n === e;
                              } else
                                var d = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/0/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var O = a === e;
                    } else
                      var O = !0;
                    if (O) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/0/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "activatePlugin")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/0/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "activatePlugin"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var O = a === e;
                      } else
                        var O = !0;
                      if (O) {
                        if (r.pluginPath !== void 0) {
                          const s = e;
                          if (typeof r.pluginPath != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/pluginPath",
                                schemaPath: "#/oneOf/0/properties/pluginPath/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var O = s === e;
                        } else
                          var O = !0;
                        if (O)
                          if (r.pluginName !== void 0) {
                            const s = e;
                            if (typeof r.pluginName != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/pluginName",
                                  schemaPath: "#/oneOf/0/properties/pluginName/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var O = s === e;
                          } else
                            var O = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/0/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "activateTheme") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.step === void 0 && (p = "step") || r.themeFolderName === void 0 && (p = "themeFolderName"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/1/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "themeFolderName"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/1/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/1/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/1/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var B = $ === e;
                            } else
                              var B = !0;
                            if (B)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/1/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var B = n === e;
                              } else
                                var B = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/1/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var I = a === e;
                    } else
                      var I = !0;
                    if (I) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/1/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "activateTheme")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/1/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "activateTheme"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var I = a === e;
                      } else
                        var I = !0;
                      if (I)
                        if (r.themeFolderName !== void 0) {
                          const s = e;
                          if (typeof r.themeFolderName != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/themeFolderName",
                                schemaPath: "#/oneOf/1/properties/themeFolderName/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var I = s === e;
                        } else
                          var I = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/1/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "cp") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.fromPath === void 0 && (p = "fromPath") || r.step === void 0 && (p = "step") || r.toPath === void 0 && (p = "toPath"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/2/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "fromPath" || s === "toPath"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/2/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/2/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/2/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var v = $ === e;
                            } else
                              var v = !0;
                            if (v)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/2/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var v = n === e;
                              } else
                                var v = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/2/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var R = a === e;
                    } else
                      var R = !0;
                    if (R) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/2/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "cp")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/2/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "cp"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var R = a === e;
                      } else
                        var R = !0;
                      if (R) {
                        if (r.fromPath !== void 0) {
                          const s = e;
                          if (typeof r.fromPath != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/fromPath",
                                schemaPath: "#/oneOf/2/properties/fromPath/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var R = s === e;
                        } else
                          var R = !0;
                        if (R)
                          if (r.toPath !== void 0) {
                            const s = e;
                            if (typeof r.toPath != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/toPath",
                                  schemaPath: "#/oneOf/2/properties/toPath/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var R = s === e;
                          } else
                            var R = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/2/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "defineWpConfigConsts") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.consts === void 0 && (p = "consts") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/3/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "consts" || s === "method" || s === "virtualize"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/3/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/3/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/3/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var M = $ === e;
                            } else
                              var M = !0;
                            if (M)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/3/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var M = n === e;
                              } else
                                var M = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/3/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var U = a === e;
                    } else
                      var U = !0;
                    if (U) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/3/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "defineWpConfigConsts")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/3/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "defineWpConfigConsts"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var U = a === e;
                      } else
                        var U = !0;
                      if (U) {
                        if (r.consts !== void 0) {
                          let s = r.consts;
                          const a = e;
                          if (e === a && !(s && typeof s == "object" && !Array.isArray(
                            s
                          )))
                            return o.errors = [
                              {
                                instancePath: t + "/consts",
                                schemaPath: "#/oneOf/3/properties/consts/type",
                                keyword: "type",
                                params: {
                                  type: "object"
                                },
                                message: "must be object"
                              }
                            ], !1;
                          var U = a === e;
                        } else
                          var U = !0;
                        if (U) {
                          if (r.method !== void 0) {
                            let s = r.method;
                            const a = e;
                            if (typeof s != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/method",
                                  schemaPath: "#/oneOf/3/properties/method/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            if (!(s === "rewrite-wp-config" || s === "define-before-run"))
                              return o.errors = [
                                {
                                  instancePath: t + "/method",
                                  schemaPath: "#/oneOf/3/properties/method/enum",
                                  keyword: "enum",
                                  params: {
                                    allowedValues: Ze.oneOf[3].properties.method.enum
                                  },
                                  message: "must be equal to one of the allowed values"
                                }
                              ], !1;
                            var U = a === e;
                          } else
                            var U = !0;
                          if (U)
                            if (r.virtualize !== void 0) {
                              const s = e;
                              if (typeof r.virtualize != "boolean")
                                return o.errors = [
                                  {
                                    instancePath: t + "/virtualize",
                                    schemaPath: "#/oneOf/3/properties/virtualize/type",
                                    keyword: "type",
                                    params: {
                                      type: "boolean"
                                    },
                                    message: "must be boolean"
                                  }
                                ], !1;
                              var U = s === e;
                            } else
                              var U = !0;
                        }
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/3/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "defineSiteUrl") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.siteUrl === void 0 && (p = "siteUrl") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/4/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "siteUrl"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/4/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/4/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/4/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var b = $ === e;
                            } else
                              var b = !0;
                            if (b)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/4/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var b = n === e;
                              } else
                                var b = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/4/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var D = a === e;
                    } else
                      var D = !0;
                    if (D) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/4/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "defineSiteUrl")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/4/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "defineSiteUrl"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var D = a === e;
                      } else
                        var D = !0;
                      if (D)
                        if (r.siteUrl !== void 0) {
                          const s = e;
                          if (typeof r.siteUrl != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/siteUrl",
                                schemaPath: "#/oneOf/4/properties/siteUrl/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var D = s === e;
                        } else
                          var D = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/4/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "enableMultisite") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/5/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/5/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/5/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/5/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var te = $ === e;
                            } else
                              var te = !0;
                            if (te)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/5/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var te = n === e;
                              } else
                                var te = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/5/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var H = a === e;
                    } else
                      var H = !0;
                    if (H)
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/5/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "enableMultisite")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/5/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "enableMultisite"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var H = a === e;
                      } else
                        var H = !0;
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/5/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "importWxr") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.file === void 0 && (p = "file") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/6/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "file"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/6/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/6/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/6/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var P = $ === e;
                            } else
                              var P = !0;
                            if (P)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/6/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var P = n === e;
                              } else
                                var P = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/6/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var A = a === e;
                    } else
                      var A = !0;
                    if (A) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/6/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "importWxr")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/6/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "importWxr"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var A = a === e;
                      } else
                        var A = !0;
                      if (A)
                        if (r.file !== void 0) {
                          const s = e;
                          re(r.file, {
                            instancePath: t + "/file",
                            parentData: r,
                            parentDataProperty: "file",
                            rootData: u
                          }) || (i = i === null ? re.errors : i.concat(
                            re.errors
                          ), e = i.length);
                          var A = s === e;
                        } else
                          var A = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/6/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "importThemeStarterContent") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/7/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "themeSlug"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/7/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/7/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/7/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var F = $ === e;
                            } else
                              var F = !0;
                            if (F)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/7/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var F = n === e;
                              } else
                                var F = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/7/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var z = a === e;
                    } else
                      var z = !0;
                    if (z) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/7/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "importThemeStarterContent")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/7/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "importThemeStarterContent"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var z = a === e;
                      } else
                        var z = !0;
                      if (z)
                        if (r.themeSlug !== void 0) {
                          const s = e;
                          if (typeof r.themeSlug != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/themeSlug",
                                schemaPath: "#/oneOf/7/properties/themeSlug/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var z = s === e;
                        } else
                          var z = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/7/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "importWordPressFiles") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.step === void 0 && (p = "step") || r.wordPressFilesZip === void 0 && (p = "wordPressFilesZip"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/8/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "wordPressFilesZip" || s === "pathInZip"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/8/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/8/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/8/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var l = $ === e;
                            } else
                              var l = !0;
                            if (l)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/8/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var l = n === e;
                              } else
                                var l = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/8/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var E = a === e;
                    } else
                      var E = !0;
                    if (E) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/8/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "importWordPressFiles")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/8/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "importWordPressFiles"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var E = a === e;
                      } else
                        var E = !0;
                      if (E) {
                        if (r.wordPressFilesZip !== void 0) {
                          const s = e;
                          re(
                            r.wordPressFilesZip,
                            {
                              instancePath: t + "/wordPressFilesZip",
                              parentData: r,
                              parentDataProperty: "wordPressFilesZip",
                              rootData: u
                            }
                          ) || (i = i === null ? re.errors : i.concat(
                            re.errors
                          ), e = i.length);
                          var E = s === e;
                        } else
                          var E = !0;
                        if (E)
                          if (r.pathInZip !== void 0) {
                            const s = e;
                            if (typeof r.pathInZip != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/pathInZip",
                                  schemaPath: "#/oneOf/8/properties/pathInZip/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var E = s === e;
                          } else
                            var E = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/8/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "installPlugin") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.pluginZipFile === void 0 && (p = "pluginZipFile") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/9/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "ifAlreadyInstalled" || s === "step" || s === "pluginZipFile" || s === "options"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/9/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/9/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/9/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var _ = $ === e;
                            } else
                              var _ = !0;
                            if (_)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/9/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var _ = n === e;
                              } else
                                var _ = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/9/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var k = a === e;
                    } else
                      var k = !0;
                    if (k) {
                      if (r.ifAlreadyInstalled !== void 0) {
                        let s = r.ifAlreadyInstalled;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/ifAlreadyInstalled",
                              schemaPath: "#/oneOf/9/properties/ifAlreadyInstalled/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (!(s === "overwrite" || s === "skip" || s === "error"))
                          return o.errors = [
                            {
                              instancePath: t + "/ifAlreadyInstalled",
                              schemaPath: "#/oneOf/9/properties/ifAlreadyInstalled/enum",
                              keyword: "enum",
                              params: {
                                allowedValues: Ze.oneOf[9].properties.ifAlreadyInstalled.enum
                              },
                              message: "must be equal to one of the allowed values"
                            }
                          ], !1;
                        var k = a === e;
                      } else
                        var k = !0;
                      if (k) {
                        if (r.step !== void 0) {
                          let s = r.step;
                          const a = e;
                          if (typeof s != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/step",
                                schemaPath: "#/oneOf/9/properties/step/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          if (s !== "installPlugin")
                            return o.errors = [
                              {
                                instancePath: t + "/step",
                                schemaPath: "#/oneOf/9/properties/step/const",
                                keyword: "const",
                                params: {
                                  allowedValue: "installPlugin"
                                },
                                message: "must be equal to constant"
                              }
                            ], !1;
                          var k = a === e;
                        } else
                          var k = !0;
                        if (k) {
                          if (r.pluginZipFile !== void 0) {
                            const s = e;
                            re(
                              r.pluginZipFile,
                              {
                                instancePath: t + "/pluginZipFile",
                                parentData: r,
                                parentDataProperty: "pluginZipFile",
                                rootData: u
                              }
                            ) || (i = i === null ? re.errors : i.concat(
                              re.errors
                            ), e = i.length);
                            var k = s === e;
                          } else
                            var k = !0;
                          if (k)
                            if (r.options !== void 0) {
                              let s = r.options;
                              const a = e;
                              if (e === e)
                                if (s && typeof s == "object" && !Array.isArray(
                                  s
                                )) {
                                  const $ = e;
                                  for (const we in s)
                                    if (we !== "activate")
                                      return o.errors = [
                                        {
                                          instancePath: t + "/options",
                                          schemaPath: "#/definitions/InstallPluginOptions/additionalProperties",
                                          keyword: "additionalProperties",
                                          params: {
                                            additionalProperty: we
                                          },
                                          message: "must NOT have additional properties"
                                        }
                                      ], !1;
                                  if ($ === e && s.activate !== void 0 && typeof s.activate != "boolean")
                                    return o.errors = [
                                      {
                                        instancePath: t + "/options/activate",
                                        schemaPath: "#/definitions/InstallPluginOptions/properties/activate/type",
                                        keyword: "type",
                                        params: {
                                          type: "boolean"
                                        },
                                        message: "must be boolean"
                                      }
                                    ], !1;
                                } else
                                  return o.errors = [
                                    {
                                      instancePath: t + "/options",
                                      schemaPath: "#/definitions/InstallPluginOptions/type",
                                      keyword: "type",
                                      params: {
                                        type: "object"
                                      },
                                      message: "must be object"
                                    }
                                  ], !1;
                              var k = a === e;
                            } else
                              var k = !0;
                        }
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/9/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "installTheme") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.step === void 0 && (p = "step") || r.themeZipFile === void 0 && (p = "themeZipFile"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/10/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "ifAlreadyInstalled" || s === "step" || s === "themeZipFile" || s === "options"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/10/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/10/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/10/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var g = $ === e;
                            } else
                              var g = !0;
                            if (g)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/10/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var g = n === e;
                              } else
                                var g = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/10/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var m = a === e;
                    } else
                      var m = !0;
                    if (m) {
                      if (r.ifAlreadyInstalled !== void 0) {
                        let s = r.ifAlreadyInstalled;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/ifAlreadyInstalled",
                              schemaPath: "#/oneOf/10/properties/ifAlreadyInstalled/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (!(s === "overwrite" || s === "skip" || s === "error"))
                          return o.errors = [
                            {
                              instancePath: t + "/ifAlreadyInstalled",
                              schemaPath: "#/oneOf/10/properties/ifAlreadyInstalled/enum",
                              keyword: "enum",
                              params: {
                                allowedValues: Ze.oneOf[10].properties.ifAlreadyInstalled.enum
                              },
                              message: "must be equal to one of the allowed values"
                            }
                          ], !1;
                        var m = a === e;
                      } else
                        var m = !0;
                      if (m) {
                        if (r.step !== void 0) {
                          let s = r.step;
                          const a = e;
                          if (typeof s != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/step",
                                schemaPath: "#/oneOf/10/properties/step/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          if (s !== "installTheme")
                            return o.errors = [
                              {
                                instancePath: t + "/step",
                                schemaPath: "#/oneOf/10/properties/step/const",
                                keyword: "const",
                                params: {
                                  allowedValue: "installTheme"
                                },
                                message: "must be equal to constant"
                              }
                            ], !1;
                          var m = a === e;
                        } else
                          var m = !0;
                        if (m) {
                          if (r.themeZipFile !== void 0) {
                            const s = e;
                            re(
                              r.themeZipFile,
                              {
                                instancePath: t + "/themeZipFile",
                                parentData: r,
                                parentDataProperty: "themeZipFile",
                                rootData: u
                              }
                            ) || (i = i === null ? re.errors : i.concat(
                              re.errors
                            ), e = i.length);
                            var m = s === e;
                          } else
                            var m = !0;
                          if (m)
                            if (r.options !== void 0) {
                              let s = r.options;
                              const a = e;
                              if (e === a)
                                if (s && typeof s == "object" && !Array.isArray(
                                  s
                                )) {
                                  const n = e;
                                  for (const $ in s)
                                    if (!($ === "activate" || $ === "importStarterContent"))
                                      return o.errors = [
                                        {
                                          instancePath: t + "/options",
                                          schemaPath: "#/oneOf/10/properties/options/additionalProperties",
                                          keyword: "additionalProperties",
                                          params: {
                                            additionalProperty: $
                                          },
                                          message: "must NOT have additional properties"
                                        }
                                      ], !1;
                                  if (n === e) {
                                    if (s.activate !== void 0) {
                                      const $ = e;
                                      if (typeof s.activate != "boolean")
                                        return o.errors = [
                                          {
                                            instancePath: t + "/options/activate",
                                            schemaPath: "#/oneOf/10/properties/options/properties/activate/type",
                                            keyword: "type",
                                            params: {
                                              type: "boolean"
                                            },
                                            message: "must be boolean"
                                          }
                                        ], !1;
                                      var y = $ === e;
                                    } else
                                      var y = !0;
                                    if (y)
                                      if (s.importStarterContent !== void 0) {
                                        const $ = e;
                                        if (typeof s.importStarterContent != "boolean")
                                          return o.errors = [
                                            {
                                              instancePath: t + "/options/importStarterContent",
                                              schemaPath: "#/oneOf/10/properties/options/properties/importStarterContent/type",
                                              keyword: "type",
                                              params: {
                                                type: "boolean"
                                              },
                                              message: "must be boolean"
                                            }
                                          ], !1;
                                        var y = $ === e;
                                      } else
                                        var y = !0;
                                  }
                                } else
                                  return o.errors = [
                                    {
                                      instancePath: t + "/options",
                                      schemaPath: "#/oneOf/10/properties/options/type",
                                      keyword: "type",
                                      params: {
                                        type: "object"
                                      },
                                      message: "must be object"
                                    }
                                  ], !1;
                              var m = a === e;
                            } else
                              var m = !0;
                        }
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/10/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "login") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/11/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "username" || s === "password"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/11/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/11/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/11/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var h = $ === e;
                            } else
                              var h = !0;
                            if (h)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/11/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var h = n === e;
                              } else
                                var h = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/11/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var w = a === e;
                    } else
                      var w = !0;
                    if (w) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/11/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "login")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/11/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "login"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var w = a === e;
                      } else
                        var w = !0;
                      if (w) {
                        if (r.username !== void 0) {
                          const s = e;
                          if (typeof r.username != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/username",
                                schemaPath: "#/oneOf/11/properties/username/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var w = s === e;
                        } else
                          var w = !0;
                        if (w)
                          if (r.password !== void 0) {
                            const s = e;
                            if (typeof r.password != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/password",
                                  schemaPath: "#/oneOf/11/properties/password/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var w = s === e;
                          } else
                            var w = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/11/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "mkdir") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.path === void 0 && (p = "path") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/12/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "path"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/12/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/12/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/12/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var L = $ === e;
                            } else
                              var L = !0;
                            if (L)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/12/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var L = n === e;
                              } else
                                var L = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/12/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var T = a === e;
                    } else
                      var T = !0;
                    if (T) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/12/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "mkdir")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/12/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "mkdir"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var T = a === e;
                      } else
                        var T = !0;
                      if (T)
                        if (r.path !== void 0) {
                          const s = e;
                          if (typeof r.path != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/path",
                                schemaPath: "#/oneOf/12/properties/path/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var T = s === e;
                        } else
                          var T = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/12/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "mv") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.fromPath === void 0 && (p = "fromPath") || r.step === void 0 && (p = "step") || r.toPath === void 0 && (p = "toPath"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/13/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "fromPath" || s === "toPath"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/13/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/13/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/13/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var x = $ === e;
                            } else
                              var x = !0;
                            if (x)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/13/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var x = n === e;
                              } else
                                var x = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/13/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var j = a === e;
                    } else
                      var j = !0;
                    if (j) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/13/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "mv")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/13/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "mv"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var j = a === e;
                      } else
                        var j = !0;
                      if (j) {
                        if (r.fromPath !== void 0) {
                          const s = e;
                          if (typeof r.fromPath != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/fromPath",
                                schemaPath: "#/oneOf/13/properties/fromPath/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var j = s === e;
                        } else
                          var j = !0;
                        if (j)
                          if (r.toPath !== void 0) {
                            const s = e;
                            if (typeof r.toPath != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/toPath",
                                  schemaPath: "#/oneOf/13/properties/toPath/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var j = s === e;
                          } else
                            var j = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/13/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "resetData") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/14/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/14/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/14/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/14/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var V = $ === e;
                            } else
                              var V = !0;
                            if (V)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/14/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var V = n === e;
                              } else
                                var V = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/14/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var ee = a === e;
                    } else
                      var ee = !0;
                    if (ee)
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/14/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "resetData")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/14/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "resetData"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var ee = a === e;
                      } else
                        var ee = !0;
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/14/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "request") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.request === void 0 && (p = "request") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/15/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "request"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/15/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/15/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/15/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var X = $ === e;
                            } else
                              var X = !0;
                            if (X)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/15/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var X = n === e;
                              } else
                                var X = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/15/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var N = a === e;
                    } else
                      var N = !0;
                    if (N) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/15/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "request")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/15/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "request"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var N = a === e;
                      } else
                        var N = !0;
                      if (N)
                        if (r.request !== void 0) {
                          const s = e;
                          ce(
                            r.request,
                            {
                              instancePath: t + "/request",
                              parentData: r,
                              parentDataProperty: "request",
                              rootData: u
                            }
                          ) || (i = i === null ? ce.errors : i.concat(
                            ce.errors
                          ), e = i.length);
                          var N = s === e;
                        } else
                          var N = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/15/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "rm") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.path === void 0 && (p = "path") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/16/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "path"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/16/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/16/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/16/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Q = $ === e;
                            } else
                              var Q = !0;
                            if (Q)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/16/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Q = n === e;
                              } else
                                var Q = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/16/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var C = a === e;
                    } else
                      var C = !0;
                    if (C) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/16/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "rm")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/16/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "rm"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var C = a === e;
                      } else
                        var C = !0;
                      if (C)
                        if (r.path !== void 0) {
                          const s = e;
                          if (typeof r.path != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/path",
                                schemaPath: "#/oneOf/16/properties/path/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var C = s === e;
                        } else
                          var C = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/16/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "rmdir") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.path === void 0 && (p = "path") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/17/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "path"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/17/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/17/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/17/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Y = $ === e;
                            } else
                              var Y = !0;
                            if (Y)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/17/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Y = n === e;
                              } else
                                var Y = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/17/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var J = a === e;
                    } else
                      var J = !0;
                    if (J) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/17/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "rmdir")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/17/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "rmdir"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var J = a === e;
                      } else
                        var J = !0;
                      if (J)
                        if (r.path !== void 0) {
                          const s = e;
                          if (typeof r.path != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/path",
                                schemaPath: "#/oneOf/17/properties/path/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var J = s === e;
                        } else
                          var J = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/17/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "runPHP") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.code === void 0 && (p = "code") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/18/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "code"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/18/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/18/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/18/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var ae = $ === e;
                            } else
                              var ae = !0;
                            if (ae)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/18/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var ae = n === e;
                              } else
                                var ae = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/18/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var pe = a === e;
                    } else
                      var pe = !0;
                    if (pe) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/18/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "runPHP")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/18/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "runPHP"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var pe = a === e;
                      } else
                        var pe = !0;
                      if (pe)
                        if (r.code !== void 0) {
                          const s = e;
                          if (typeof r.code != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/code",
                                schemaPath: "#/oneOf/18/properties/code/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var pe = s === e;
                        } else
                          var pe = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/18/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "runPHPWithOptions") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.options === void 0 && (p = "options") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/19/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "options"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/19/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/19/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/19/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Ae = $ === e;
                            } else
                              var Ae = !0;
                            if (Ae)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/19/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Ae = n === e;
                              } else
                                var Ae = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/19/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var Pe = a === e;
                    } else
                      var Pe = !0;
                    if (Pe) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/19/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "runPHPWithOptions")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/19/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "runPHPWithOptions"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var Pe = a === e;
                      } else
                        var Pe = !0;
                      if (Pe)
                        if (r.options !== void 0) {
                          const s = e;
                          ie(
                            r.options,
                            {
                              instancePath: t + "/options",
                              parentData: r,
                              parentDataProperty: "options",
                              rootData: u
                            }
                          ) || (i = i === null ? ie.errors : i.concat(
                            ie.errors
                          ), e = i.length);
                          var Pe = s === e;
                        } else
                          var Pe = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/19/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "runWpInstallationWizard") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.options === void 0 && (p = "options") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/20/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "options"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/20/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/20/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/20/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Re = $ === e;
                            } else
                              var Re = !0;
                            if (Re)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/20/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Re = n === e;
                              } else
                                var Re = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/20/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var _e = a === e;
                    } else
                      var _e = !0;
                    if (_e) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/20/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "runWpInstallationWizard")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/20/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "runWpInstallationWizard"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var _e = a === e;
                      } else
                        var _e = !0;
                      if (_e)
                        if (r.options !== void 0) {
                          let s = r.options;
                          const a = e;
                          if (e === e)
                            if (s && typeof s == "object" && !Array.isArray(
                              s
                            )) {
                              const $ = e;
                              for (const we in s)
                                if (!(we === "adminUsername" || we === "adminPassword"))
                                  return o.errors = [
                                    {
                                      instancePath: t + "/options",
                                      schemaPath: "#/definitions/WordPressInstallationOptions/additionalProperties",
                                      keyword: "additionalProperties",
                                      params: {
                                        additionalProperty: we
                                      },
                                      message: "must NOT have additional properties"
                                    }
                                  ], !1;
                              if ($ === e) {
                                if (s.adminUsername !== void 0) {
                                  const we = e;
                                  if (typeof s.adminUsername != "string")
                                    return o.errors = [
                                      {
                                        instancePath: t + "/options/adminUsername",
                                        schemaPath: "#/definitions/WordPressInstallationOptions/properties/adminUsername/type",
                                        keyword: "type",
                                        params: {
                                          type: "string"
                                        },
                                        message: "must be string"
                                      }
                                    ], !1;
                                  var Le = we === e;
                                } else
                                  var Le = !0;
                                if (Le)
                                  if (s.adminPassword !== void 0) {
                                    const we = e;
                                    if (typeof s.adminPassword != "string")
                                      return o.errors = [
                                        {
                                          instancePath: t + "/options/adminPassword",
                                          schemaPath: "#/definitions/WordPressInstallationOptions/properties/adminPassword/type",
                                          keyword: "type",
                                          params: {
                                            type: "string"
                                          },
                                          message: "must be string"
                                        }
                                      ], !1;
                                    var Le = we === e;
                                  } else
                                    var Le = !0;
                              }
                            } else
                              return o.errors = [
                                {
                                  instancePath: t + "/options",
                                  schemaPath: "#/definitions/WordPressInstallationOptions/type",
                                  keyword: "type",
                                  params: {
                                    type: "object"
                                  },
                                  message: "must be object"
                                }
                              ], !1;
                          var _e = a === e;
                        } else
                          var _e = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/20/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "runSql") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.sql === void 0 && (p = "sql") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/21/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "sql"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/21/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/21/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/21/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Se = $ === e;
                            } else
                              var Se = !0;
                            if (Se)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/21/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Se = n === e;
                              } else
                                var Se = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/21/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var ke = a === e;
                    } else
                      var ke = !0;
                    if (ke) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/21/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "runSql")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/21/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "runSql"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var ke = a === e;
                      } else
                        var ke = !0;
                      if (ke)
                        if (r.sql !== void 0) {
                          const s = e;
                          re(r.sql, {
                            instancePath: t + "/sql",
                            parentData: r,
                            parentDataProperty: "sql",
                            rootData: u
                          }) || (i = i === null ? re.errors : i.concat(
                            re.errors
                          ), e = i.length);
                          var ke = s === e;
                        } else
                          var ke = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/21/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "setSiteOptions") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.options === void 0 && (p = "options") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/22/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "options"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/22/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/22/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/22/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Ne = $ === e;
                            } else
                              var Ne = !0;
                            if (Ne)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/22/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Ne = n === e;
                              } else
                                var Ne = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/22/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var Oe = a === e;
                    } else
                      var Oe = !0;
                    if (Oe) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/22/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "setSiteOptions")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/22/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "setSiteOptions"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var Oe = a === e;
                      } else
                        var Oe = !0;
                      if (Oe)
                        if (r.options !== void 0) {
                          let s = r.options;
                          const a = e;
                          if (e === a && !(s && typeof s == "object" && !Array.isArray(
                            s
                          )))
                            return o.errors = [
                              {
                                instancePath: t + "/options",
                                schemaPath: "#/oneOf/22/properties/options/type",
                                keyword: "type",
                                params: {
                                  type: "object"
                                },
                                message: "must be object"
                              }
                            ], !1;
                          var Oe = a === e;
                        } else
                          var Oe = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/22/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "unzip") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.extractToPath === void 0 && (p = "extractToPath") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/23/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "zipFile" || s === "zipPath" || s === "extractToPath"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/23/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/23/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/23/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Fe = $ === e;
                            } else
                              var Fe = !0;
                            if (Fe)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/23/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Fe = n === e;
                              } else
                                var Fe = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/23/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var fe = a === e;
                    } else
                      var fe = !0;
                    if (fe) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/23/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "unzip")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/23/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "unzip"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var fe = a === e;
                      } else
                        var fe = !0;
                      if (fe) {
                        if (r.zipFile !== void 0) {
                          const s = e;
                          re(
                            r.zipFile,
                            {
                              instancePath: t + "/zipFile",
                              parentData: r,
                              parentDataProperty: "zipFile",
                              rootData: u
                            }
                          ) || (i = i === null ? re.errors : i.concat(
                            re.errors
                          ), e = i.length);
                          var fe = s === e;
                        } else
                          var fe = !0;
                        if (fe) {
                          if (r.zipPath !== void 0) {
                            const s = e;
                            if (typeof r.zipPath != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/zipPath",
                                  schemaPath: "#/oneOf/23/properties/zipPath/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var fe = s === e;
                          } else
                            var fe = !0;
                          if (fe)
                            if (r.extractToPath !== void 0) {
                              const s = e;
                              if (typeof r.extractToPath != "string")
                                return o.errors = [
                                  {
                                    instancePath: t + "/extractToPath",
                                    schemaPath: "#/oneOf/23/properties/extractToPath/type",
                                    keyword: "type",
                                    params: {
                                      type: "string"
                                    },
                                    message: "must be string"
                                  }
                                ], !1;
                              var fe = s === e;
                            } else
                              var fe = !0;
                        }
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/23/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "updateUserMeta") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.meta === void 0 && (p = "meta") || r.step === void 0 && (p = "step") || r.userId === void 0 && (p = "userId"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/24/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "meta" || s === "userId"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/24/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/24/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/24/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var xe = $ === e;
                            } else
                              var xe = !0;
                            if (xe)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/24/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var xe = n === e;
                              } else
                                var xe = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/24/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var he = a === e;
                    } else
                      var he = !0;
                    if (he) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/24/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "updateUserMeta")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/24/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "updateUserMeta"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var he = a === e;
                      } else
                        var he = !0;
                      if (he) {
                        if (r.meta !== void 0) {
                          let s = r.meta;
                          const a = e;
                          if (e === a && !(s && typeof s == "object" && !Array.isArray(
                            s
                          )))
                            return o.errors = [
                              {
                                instancePath: t + "/meta",
                                schemaPath: "#/oneOf/24/properties/meta/type",
                                keyword: "type",
                                params: {
                                  type: "object"
                                },
                                message: "must be object"
                              }
                            ], !1;
                          var he = a === e;
                        } else
                          var he = !0;
                        if (he)
                          if (r.userId !== void 0) {
                            let s = r.userId;
                            const a = e;
                            if (!(typeof s == "number" && isFinite(
                              s
                            )))
                              return o.errors = [
                                {
                                  instancePath: t + "/userId",
                                  schemaPath: "#/oneOf/24/properties/userId/type",
                                  keyword: "type",
                                  params: {
                                    type: "number"
                                  },
                                  message: "must be number"
                                }
                              ], !1;
                            var he = a === e;
                          } else
                            var he = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/24/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "writeFile") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.data === void 0 && (p = "data") || r.path === void 0 && (p = "path") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/25/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "path" || s === "data"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/25/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/25/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/25/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Ce = $ === e;
                            } else
                              var Ce = !0;
                            if (Ce)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/25/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Ce = n === e;
                              } else
                                var Ce = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/25/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var ge = a === e;
                    } else
                      var ge = !0;
                    if (ge) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/25/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "writeFile")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/25/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "writeFile"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var ge = a === e;
                      } else
                        var ge = !0;
                      if (ge) {
                        if (r.path !== void 0) {
                          const s = e;
                          if (typeof r.path != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/path",
                                schemaPath: "#/oneOf/25/properties/path/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var ge = s === e;
                        } else
                          var ge = !0;
                        if (ge)
                          if (r.data !== void 0) {
                            let s = r.data;
                            const a = e, q = e;
                            let n = !1;
                            const $ = e;
                            re(
                              s,
                              {
                                instancePath: t + "/data",
                                parentData: r,
                                parentDataProperty: "data",
                                rootData: u
                              }
                            ) || (i = i === null ? re.errors : i.concat(
                              re.errors
                            ), e = i.length);
                            var Te = $ === e;
                            if (n = n || Te, !n) {
                              const de = e;
                              if (typeof s != "string") {
                                const ve = {
                                  instancePath: t + "/data",
                                  schemaPath: "#/oneOf/25/properties/data/anyOf/1/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                };
                                i === null ? i = [
                                  ve
                                ] : i.push(
                                  ve
                                ), e++;
                              }
                              var Te = de === e;
                              if (n = n || Te, !n) {
                                const ve = e;
                                if (e === ve)
                                  if (s && typeof s == "object" && !Array.isArray(
                                    s
                                  )) {
                                    let ye;
                                    if (s.BYTES_PER_ELEMENT === void 0 && (ye = "BYTES_PER_ELEMENT") || s.buffer === void 0 && (ye = "buffer") || s.byteLength === void 0 && (ye = "byteLength") || s.byteOffset === void 0 && (ye = "byteOffset") || s.length === void 0 && (ye = "length")) {
                                      const Be = {
                                        instancePath: t + "/data",
                                        schemaPath: "#/oneOf/25/properties/data/anyOf/2/required",
                                        keyword: "required",
                                        params: {
                                          missingProperty: ye
                                        },
                                        message: "must have required property '" + ye + "'"
                                      };
                                      i === null ? i = [
                                        Be
                                      ] : i.push(
                                        Be
                                      ), e++;
                                    } else {
                                      const Be = e;
                                      for (const Z in s)
                                        if (!(Z === "BYTES_PER_ELEMENT" || Z === "buffer" || Z === "byteLength" || Z === "byteOffset" || Z === "length")) {
                                          let ue = s[Z];
                                          const De = e;
                                          if (!(typeof ue == "number" && isFinite(
                                            ue
                                          ))) {
                                            const ne = {
                                              instancePath: t + "/data/" + Z.replace(
                                                /~/g,
                                                "~0"
                                              ).replace(
                                                /\//g,
                                                "~1"
                                              ),
                                              schemaPath: "#/oneOf/25/properties/data/anyOf/2/additionalProperties/type",
                                              keyword: "type",
                                              params: {
                                                type: "number"
                                              },
                                              message: "must be number"
                                            };
                                            i === null ? i = [
                                              ne
                                            ] : i.push(
                                              ne
                                            ), e++;
                                          }
                                          var vr = De === e;
                                          if (!vr)
                                            break;
                                        }
                                      if (Be === e) {
                                        if (s.BYTES_PER_ELEMENT !== void 0) {
                                          let Z = s.BYTES_PER_ELEMENT;
                                          const ue = e;
                                          if (!(typeof Z == "number" && isFinite(
                                            Z
                                          ))) {
                                            const De = {
                                              instancePath: t + "/data/BYTES_PER_ELEMENT",
                                              schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/BYTES_PER_ELEMENT/type",
                                              keyword: "type",
                                              params: {
                                                type: "number"
                                              },
                                              message: "must be number"
                                            };
                                            i === null ? i = [
                                              De
                                            ] : i.push(
                                              De
                                            ), e++;
                                          }
                                          var le = ue === e;
                                        } else
                                          var le = !0;
                                        if (le) {
                                          if (s.buffer !== void 0) {
                                            let Z = s.buffer;
                                            const ue = e;
                                            if (e === ue)
                                              if (Z && typeof Z == "object" && !Array.isArray(
                                                Z
                                              )) {
                                                let ne;
                                                if (Z.byteLength === void 0 && (ne = "byteLength")) {
                                                  const Me = {
                                                    instancePath: t + "/data/buffer",
                                                    schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/buffer/required",
                                                    keyword: "required",
                                                    params: {
                                                      missingProperty: ne
                                                    },
                                                    message: "must have required property '" + ne + "'"
                                                  };
                                                  i === null ? i = [
                                                    Me
                                                  ] : i.push(
                                                    Me
                                                  ), e++;
                                                } else {
                                                  const Me = e;
                                                  for (const je in Z)
                                                    if (je !== "byteLength") {
                                                      const qe = {
                                                        instancePath: t + "/data/buffer",
                                                        schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/buffer/additionalProperties",
                                                        keyword: "additionalProperties",
                                                        params: {
                                                          additionalProperty: je
                                                        },
                                                        message: "must NOT have additional properties"
                                                      };
                                                      i === null ? i = [
                                                        qe
                                                      ] : i.push(
                                                        qe
                                                      ), e++;
                                                      break;
                                                    }
                                                  if (Me === e && Z.byteLength !== void 0) {
                                                    let je = Z.byteLength;
                                                    if (!(typeof je == "number" && isFinite(
                                                      je
                                                    ))) {
                                                      const qe = {
                                                        instancePath: t + "/data/buffer/byteLength",
                                                        schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/buffer/properties/byteLength/type",
                                                        keyword: "type",
                                                        params: {
                                                          type: "number"
                                                        },
                                                        message: "must be number"
                                                      };
                                                      i === null ? i = [
                                                        qe
                                                      ] : i.push(
                                                        qe
                                                      ), e++;
                                                    }
                                                  }
                                                }
                                              } else {
                                                const ne = {
                                                  instancePath: t + "/data/buffer",
                                                  schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/buffer/type",
                                                  keyword: "type",
                                                  params: {
                                                    type: "object"
                                                  },
                                                  message: "must be object"
                                                };
                                                i === null ? i = [
                                                  ne
                                                ] : i.push(
                                                  ne
                                                ), e++;
                                              }
                                            var le = ue === e;
                                          } else
                                            var le = !0;
                                          if (le) {
                                            if (s.byteLength !== void 0) {
                                              let Z = s.byteLength;
                                              const ue = e;
                                              if (!(typeof Z == "number" && isFinite(
                                                Z
                                              ))) {
                                                const ne = {
                                                  instancePath: t + "/data/byteLength",
                                                  schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/byteLength/type",
                                                  keyword: "type",
                                                  params: {
                                                    type: "number"
                                                  },
                                                  message: "must be number"
                                                };
                                                i === null ? i = [
                                                  ne
                                                ] : i.push(
                                                  ne
                                                ), e++;
                                              }
                                              var le = ue === e;
                                            } else
                                              var le = !0;
                                            if (le) {
                                              if (s.byteOffset !== void 0) {
                                                let Z = s.byteOffset;
                                                const ue = e;
                                                if (!(typeof Z == "number" && isFinite(
                                                  Z
                                                ))) {
                                                  const ne = {
                                                    instancePath: t + "/data/byteOffset",
                                                    schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/byteOffset/type",
                                                    keyword: "type",
                                                    params: {
                                                      type: "number"
                                                    },
                                                    message: "must be number"
                                                  };
                                                  i === null ? i = [
                                                    ne
                                                  ] : i.push(
                                                    ne
                                                  ), e++;
                                                }
                                                var le = ue === e;
                                              } else
                                                var le = !0;
                                              if (le)
                                                if (s.length !== void 0) {
                                                  let Z = s.length;
                                                  const ue = e;
                                                  if (!(typeof Z == "number" && isFinite(
                                                    Z
                                                  ))) {
                                                    const ne = {
                                                      instancePath: t + "/data/length",
                                                      schemaPath: "#/oneOf/25/properties/data/anyOf/2/properties/length/type",
                                                      keyword: "type",
                                                      params: {
                                                        type: "number"
                                                      },
                                                      message: "must be number"
                                                    };
                                                    i === null ? i = [
                                                      ne
                                                    ] : i.push(
                                                      ne
                                                    ), e++;
                                                  }
                                                  var le = ue === e;
                                                } else
                                                  var le = !0;
                                            }
                                          }
                                        }
                                      }
                                    }
                                  } else {
                                    const ye = {
                                      instancePath: t + "/data",
                                      schemaPath: "#/oneOf/25/properties/data/anyOf/2/type",
                                      keyword: "type",
                                      params: {
                                        type: "object"
                                      },
                                      message: "must be object"
                                    };
                                    i === null ? i = [
                                      ye
                                    ] : i.push(
                                      ye
                                    ), e++;
                                  }
                                var Te = ve === e;
                                n = n || Te;
                              }
                            }
                            if (n)
                              e = q, i !== null && (q ? i.length = q : i = null);
                            else {
                              const de = {
                                instancePath: t + "/data",
                                schemaPath: "#/oneOf/25/properties/data/anyOf",
                                keyword: "anyOf",
                                params: {},
                                message: "must match a schema in anyOf"
                              };
                              return i === null ? i = [
                                de
                              ] : i.push(
                                de
                              ), e++, o.errors = i, !1;
                            }
                            var ge = a === e;
                          } else
                            var ge = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/25/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "wp-cli") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.command === void 0 && (p = "command") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/26/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "command" || s === "wpCliPath"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/26/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/26/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/26/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Ie = $ === e;
                            } else
                              var Ie = !0;
                            if (Ie)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/26/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Ie = n === e;
                              } else
                                var Ie = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/26/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var be = a === e;
                    } else
                      var be = !0;
                    if (be) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/26/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "wp-cli")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/26/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "wp-cli"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var be = a === e;
                      } else
                        var be = !0;
                      if (be) {
                        if (r.command !== void 0) {
                          let s = r.command;
                          const a = e, q = e;
                          let n = !1;
                          const $ = e;
                          if (typeof s != "string") {
                            const de = {
                              instancePath: t + "/command",
                              schemaPath: "#/oneOf/26/properties/command/anyOf/0/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            };
                            i === null ? i = [de] : i.push(de), e++;
                          }
                          var Ge = $ === e;
                          if (n = n || Ge, !n) {
                            const de = e;
                            if (e === de)
                              if (Array.isArray(
                                s
                              )) {
                                var tr = !0;
                                const ve = s.length;
                                for (let We = 0; We < ve; We++) {
                                  const ye = e;
                                  if (typeof s[We] != "string") {
                                    const Z = {
                                      instancePath: t + "/command/" + We,
                                      schemaPath: "#/oneOf/26/properties/command/anyOf/1/items/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    };
                                    i === null ? i = [
                                      Z
                                    ] : i.push(
                                      Z
                                    ), e++;
                                  }
                                  var tr = ye === e;
                                  if (!tr)
                                    break;
                                }
                              } else {
                                const ve = {
                                  instancePath: t + "/command",
                                  schemaPath: "#/oneOf/26/properties/command/anyOf/1/type",
                                  keyword: "type",
                                  params: {
                                    type: "array"
                                  },
                                  message: "must be array"
                                };
                                i === null ? i = [
                                  ve
                                ] : i.push(
                                  ve
                                ), e++;
                              }
                            var Ge = de === e;
                            n = n || Ge;
                          }
                          if (n)
                            e = q, i !== null && (q ? i.length = q : i = null);
                          else {
                            const de = {
                              instancePath: t + "/command",
                              schemaPath: "#/oneOf/26/properties/command/anyOf",
                              keyword: "anyOf",
                              params: {},
                              message: "must match a schema in anyOf"
                            };
                            return i === null ? i = [de] : i.push(de), e++, o.errors = i, !1;
                          }
                          var be = a === e;
                        } else
                          var be = !0;
                        if (be)
                          if (r.wpCliPath !== void 0) {
                            const s = e;
                            if (typeof r.wpCliPath != "string")
                              return o.errors = [
                                {
                                  instancePath: t + "/wpCliPath",
                                  schemaPath: "#/oneOf/26/properties/wpCliPath/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var be = s === e;
                          } else
                            var be = !0;
                      }
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/26/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else if (G === "setSiteLanguage") {
            if (e === e)
              if (r && typeof r == "object" && !Array.isArray(r)) {
                let p;
                if (r.language === void 0 && (p = "language") || r.step === void 0 && (p = "step"))
                  return o.errors = [
                    {
                      instancePath: t,
                      schemaPath: "#/oneOf/27/required",
                      keyword: "required",
                      params: {
                        missingProperty: p
                      },
                      message: "must have required property '" + p + "'"
                    }
                  ], !1;
                {
                  const S = e;
                  for (const s in r)
                    if (!(s === "progress" || s === "step" || s === "language"))
                      return o.errors = [
                        {
                          instancePath: t,
                          schemaPath: "#/oneOf/27/additionalProperties",
                          keyword: "additionalProperties",
                          params: {
                            additionalProperty: s
                          },
                          message: "must NOT have additional properties"
                        }
                      ], !1;
                  if (S === e) {
                    if (r.progress !== void 0) {
                      let s = r.progress;
                      const a = e;
                      if (e === a)
                        if (s && typeof s == "object" && !Array.isArray(s)) {
                          const q = e;
                          for (const n in s)
                            if (!(n === "weight" || n === "caption"))
                              return o.errors = [
                                {
                                  instancePath: t + "/progress",
                                  schemaPath: "#/oneOf/27/properties/progress/additionalProperties",
                                  keyword: "additionalProperties",
                                  params: {
                                    additionalProperty: n
                                  },
                                  message: "must NOT have additional properties"
                                }
                              ], !1;
                          if (q === e) {
                            if (s.weight !== void 0) {
                              let n = s.weight;
                              const $ = e;
                              if (!(typeof n == "number" && isFinite(
                                n
                              )))
                                return o.errors = [
                                  {
                                    instancePath: t + "/progress/weight",
                                    schemaPath: "#/oneOf/27/properties/progress/properties/weight/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  }
                                ], !1;
                              var Ue = $ === e;
                            } else
                              var Ue = !0;
                            if (Ue)
                              if (s.caption !== void 0) {
                                const n = e;
                                if (typeof s.caption != "string")
                                  return o.errors = [
                                    {
                                      instancePath: t + "/progress/caption",
                                      schemaPath: "#/oneOf/27/properties/progress/properties/caption/type",
                                      keyword: "type",
                                      params: {
                                        type: "string"
                                      },
                                      message: "must be string"
                                    }
                                  ], !1;
                                var Ue = n === e;
                              } else
                                var Ue = !0;
                          }
                        } else
                          return o.errors = [
                            {
                              instancePath: t + "/progress",
                              schemaPath: "#/oneOf/27/properties/progress/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var $e = a === e;
                    } else
                      var $e = !0;
                    if ($e) {
                      if (r.step !== void 0) {
                        let s = r.step;
                        const a = e;
                        if (typeof s != "string")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/27/properties/step/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        if (s !== "setSiteLanguage")
                          return o.errors = [
                            {
                              instancePath: t + "/step",
                              schemaPath: "#/oneOf/27/properties/step/const",
                              keyword: "const",
                              params: {
                                allowedValue: "setSiteLanguage"
                              },
                              message: "must be equal to constant"
                            }
                          ], !1;
                        var $e = a === e;
                      } else
                        var $e = !0;
                      if ($e)
                        if (r.language !== void 0) {
                          const s = e;
                          if (typeof r.language != "string")
                            return o.errors = [
                              {
                                instancePath: t + "/language",
                                schemaPath: "#/oneOf/27/properties/language/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var $e = s === e;
                        } else
                          var $e = !0;
                    }
                  }
                }
              } else
                return o.errors = [
                  {
                    instancePath: t,
                    schemaPath: "#/oneOf/27/type",
                    keyword: "type",
                    params: { type: "object" },
                    message: "must be object"
                  }
                ], !1;
          } else
            return o.errors = [
              {
                instancePath: t,
                schemaPath: "#/discriminator",
                keyword: "discriminator",
                params: {
                  error: "mapping",
                  tag: "step",
                  tagValue: G
                },
                message: 'value of tag "step" must be in oneOf'
              }
            ], !1;
        else
          return o.errors = [
            {
              instancePath: t,
              schemaPath: "#/discriminator",
              keyword: "discriminator",
              params: {
                error: "tag",
                tag: "step",
                tagValue: G
              },
              message: 'tag "step" must be string'
            }
          ], !1;
      }
    } else
      return o.errors = [
        {
          instancePath: t,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
      ], !1;
  return o.errors = i, e === 0;
}
function W(r, { instancePath: t = "", parentData: f, parentDataProperty: c, rootData: u = r } = {}) {
  let i = null, e = 0;
  if (e === 0)
    if (r && typeof r == "object" && !Array.isArray(r)) {
      const z = e;
      for (const l in r)
        if (!br.call(yt.properties, l))
          return W.errors = [
            {
              instancePath: t,
              schemaPath: "#/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: l },
              message: "must NOT have additional properties"
            }
          ], !1;
      if (z === e) {
        if (r.landingPage !== void 0) {
          const l = e;
          if (typeof r.landingPage != "string")
            return W.errors = [
              {
                instancePath: t + "/landingPage",
                schemaPath: "#/properties/landingPage/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
            ], !1;
          var d = l === e;
        } else
          var d = !0;
        if (d) {
          if (r.description !== void 0) {
            const l = e;
            if (typeof r.description != "string")
              return W.errors = [
                {
                  instancePath: t + "/description",
                  schemaPath: "#/properties/description/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
              ], !1;
            var d = l === e;
          } else
            var d = !0;
          if (d) {
            if (r.meta !== void 0) {
              let l = r.meta;
              const E = e;
              if (e === E)
                if (l && typeof l == "object" && !Array.isArray(l)) {
                  let k;
                  if (l.title === void 0 && (k = "title") || l.author === void 0 && (k = "author"))
                    return W.errors = [
                      {
                        instancePath: t + "/meta",
                        schemaPath: "#/properties/meta/required",
                        keyword: "required",
                        params: {
                          missingProperty: k
                        },
                        message: "must have required property '" + k + "'"
                      }
                    ], !1;
                  {
                    const g = e;
                    for (const m in l)
                      if (!(m === "title" || m === "description" || m === "author" || m === "categories"))
                        return W.errors = [
                          {
                            instancePath: t + "/meta",
                            schemaPath: "#/properties/meta/additionalProperties",
                            keyword: "additionalProperties",
                            params: {
                              additionalProperty: m
                            },
                            message: "must NOT have additional properties"
                          }
                        ], !1;
                    if (g === e) {
                      if (l.title !== void 0) {
                        const m = e;
                        if (typeof l.title != "string")
                          return W.errors = [
                            {
                              instancePath: t + "/meta/title",
                              schemaPath: "#/properties/meta/properties/title/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            }
                          ], !1;
                        var O = m === e;
                      } else
                        var O = !0;
                      if (O) {
                        if (l.description !== void 0) {
                          const m = e;
                          if (typeof l.description != "string")
                            return W.errors = [
                              {
                                instancePath: t + "/meta/description",
                                schemaPath: "#/properties/meta/properties/description/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          var O = m === e;
                        } else
                          var O = !0;
                        if (O) {
                          if (l.author !== void 0) {
                            const m = e;
                            if (typeof l.author != "string")
                              return W.errors = [
                                {
                                  instancePath: t + "/meta/author",
                                  schemaPath: "#/properties/meta/properties/author/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var O = m === e;
                          } else
                            var O = !0;
                          if (O)
                            if (l.categories !== void 0) {
                              let m = l.categories;
                              const y = e;
                              if (e === y)
                                if (Array.isArray(
                                  m
                                )) {
                                  var B = !0;
                                  const w = m.length;
                                  for (let L = 0; L < w; L++) {
                                    const T = e;
                                    if (typeof m[L] != "string")
                                      return W.errors = [
                                        {
                                          instancePath: t + "/meta/categories/" + L,
                                          schemaPath: "#/properties/meta/properties/categories/items/type",
                                          keyword: "type",
                                          params: {
                                            type: "string"
                                          },
                                          message: "must be string"
                                        }
                                      ], !1;
                                    var B = T === e;
                                    if (!B)
                                      break;
                                  }
                                } else
                                  return W.errors = [
                                    {
                                      instancePath: t + "/meta/categories",
                                      schemaPath: "#/properties/meta/properties/categories/type",
                                      keyword: "type",
                                      params: {
                                        type: "array"
                                      },
                                      message: "must be array"
                                    }
                                  ], !1;
                              var O = y === e;
                            } else
                              var O = !0;
                        }
                      }
                    }
                  }
                } else
                  return W.errors = [
                    {
                      instancePath: t + "/meta",
                      schemaPath: "#/properties/meta/type",
                      keyword: "type",
                      params: { type: "object" },
                      message: "must be object"
                    }
                  ], !1;
              var d = E === e;
            } else
              var d = !0;
            if (d) {
              if (r.preferredVersions !== void 0) {
                let l = r.preferredVersions;
                const E = e;
                if (e === E)
                  if (l && typeof l == "object" && !Array.isArray(l)) {
                    let k;
                    if (l.php === void 0 && (k = "php") || l.wp === void 0 && (k = "wp"))
                      return W.errors = [
                        {
                          instancePath: t + "/preferredVersions",
                          schemaPath: "#/properties/preferredVersions/required",
                          keyword: "required",
                          params: {
                            missingProperty: k
                          },
                          message: "must have required property '" + k + "'"
                        }
                      ], !1;
                    {
                      const g = e;
                      for (const m in l)
                        if (!(m === "php" || m === "wp"))
                          return W.errors = [
                            {
                              instancePath: t + "/preferredVersions",
                              schemaPath: "#/properties/preferredVersions/additionalProperties",
                              keyword: "additionalProperties",
                              params: {
                                additionalProperty: m
                              },
                              message: "must NOT have additional properties"
                            }
                          ], !1;
                      if (g === e) {
                        if (l.php !== void 0) {
                          let m = l.php;
                          const y = e, h = e;
                          let w = !1;
                          const L = e;
                          if (typeof m != "string") {
                            const T = {
                              instancePath: t + "/preferredVersions/php",
                              schemaPath: "#/definitions/SupportedPHPVersion/type",
                              keyword: "type",
                              params: {
                                type: "string"
                              },
                              message: "must be string"
                            };
                            i === null ? i = [T] : i.push(T), e++;
                          }
                          if (!(m === "8.3" || m === "8.2" || m === "8.1" || m === "8.0" || m === "7.4" || m === "7.3" || m === "7.2" || m === "7.1" || m === "7.0")) {
                            const T = {
                              instancePath: t + "/preferredVersions/php",
                              schemaPath: "#/definitions/SupportedPHPVersion/enum",
                              keyword: "enum",
                              params: {
                                allowedValues: ht.enum
                              },
                              message: "must be equal to one of the allowed values"
                            };
                            i === null ? i = [T] : i.push(T), e++;
                          }
                          var I = L === e;
                          if (w = w || I, !w) {
                            const T = e;
                            if (typeof m != "string") {
                              const j = {
                                instancePath: t + "/preferredVersions/php",
                                schemaPath: "#/properties/preferredVersions/properties/php/anyOf/1/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              };
                              i === null ? i = [
                                j
                              ] : i.push(
                                j
                              ), e++;
                            }
                            if (m !== "latest") {
                              const j = {
                                instancePath: t + "/preferredVersions/php",
                                schemaPath: "#/properties/preferredVersions/properties/php/anyOf/1/const",
                                keyword: "const",
                                params: {
                                  allowedValue: "latest"
                                },
                                message: "must be equal to constant"
                              };
                              i === null ? i = [
                                j
                              ] : i.push(
                                j
                              ), e++;
                            }
                            var I = T === e;
                            w = w || I;
                          }
                          if (w)
                            e = h, i !== null && (h ? i.length = h : i = null);
                          else {
                            const T = {
                              instancePath: t + "/preferredVersions/php",
                              schemaPath: "#/properties/preferredVersions/properties/php/anyOf",
                              keyword: "anyOf",
                              params: {},
                              message: "must match a schema in anyOf"
                            };
                            return i === null ? i = [T] : i.push(T), e++, W.errors = i, !1;
                          }
                          var v = y === e;
                        } else
                          var v = !0;
                        if (v)
                          if (l.wp !== void 0) {
                            const m = e;
                            if (typeof l.wp != "string")
                              return W.errors = [
                                {
                                  instancePath: t + "/preferredVersions/wp",
                                  schemaPath: "#/properties/preferredVersions/properties/wp/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var v = m === e;
                          } else
                            var v = !0;
                      }
                    }
                  } else
                    return W.errors = [
                      {
                        instancePath: t + "/preferredVersions",
                        schemaPath: "#/properties/preferredVersions/type",
                        keyword: "type",
                        params: { type: "object" },
                        message: "must be object"
                      }
                    ], !1;
                var d = E === e;
              } else
                var d = !0;
              if (d) {
                if (r.features !== void 0) {
                  let l = r.features;
                  const E = e;
                  if (e === E)
                    if (l && typeof l == "object" && !Array.isArray(l)) {
                      const k = e;
                      for (const g in l)
                        if (g !== "networking")
                          return W.errors = [
                            {
                              instancePath: t + "/features",
                              schemaPath: "#/properties/features/additionalProperties",
                              keyword: "additionalProperties",
                              params: {
                                additionalProperty: g
                              },
                              message: "must NOT have additional properties"
                            }
                          ], !1;
                      if (k === e && l.networking !== void 0 && typeof l.networking != "boolean")
                        return W.errors = [
                          {
                            instancePath: t + "/features/networking",
                            schemaPath: "#/properties/features/properties/networking/type",
                            keyword: "type",
                            params: {
                              type: "boolean"
                            },
                            message: "must be boolean"
                          }
                        ], !1;
                    } else
                      return W.errors = [
                        {
                          instancePath: t + "/features",
                          schemaPath: "#/properties/features/type",
                          keyword: "type",
                          params: { type: "object" },
                          message: "must be object"
                        }
                      ], !1;
                  var d = E === e;
                } else
                  var d = !0;
                if (d) {
                  if (r.extraLibraries !== void 0) {
                    let l = r.extraLibraries;
                    const E = e;
                    if (e === E)
                      if (Array.isArray(l)) {
                        var R = !0;
                        const k = l.length;
                        for (let g = 0; g < k; g++) {
                          let m = l[g];
                          const y = e;
                          if (typeof m != "string")
                            return W.errors = [
                              {
                                instancePath: t + "/extraLibraries/" + g,
                                schemaPath: "#/definitions/ExtraLibrary/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              }
                            ], !1;
                          if (m !== "wp-cli")
                            return W.errors = [
                              {
                                instancePath: t + "/extraLibraries/" + g,
                                schemaPath: "#/definitions/ExtraLibrary/const",
                                keyword: "const",
                                params: {
                                  allowedValue: "wp-cli"
                                },
                                message: "must be equal to constant"
                              }
                            ], !1;
                          var R = y === e;
                          if (!R)
                            break;
                        }
                      } else
                        return W.errors = [
                          {
                            instancePath: t + "/extraLibraries",
                            schemaPath: "#/properties/extraLibraries/type",
                            keyword: "type",
                            params: {
                              type: "array"
                            },
                            message: "must be array"
                          }
                        ], !1;
                    var d = E === e;
                  } else
                    var d = !0;
                  if (d) {
                    if (r.constants !== void 0) {
                      let l = r.constants;
                      const E = e;
                      if (e === E)
                        if (l && typeof l == "object" && !Array.isArray(l))
                          for (const k in l) {
                            const g = e;
                            if (typeof l[k] != "string")
                              return W.errors = [
                                {
                                  instancePath: t + "/constants/" + k.replace(
                                    /~/g,
                                    "~0"
                                  ).replace(
                                    /\//g,
                                    "~1"
                                  ),
                                  schemaPath: "#/properties/constants/additionalProperties/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                }
                              ], !1;
                            var M = g === e;
                            if (!M)
                              break;
                          }
                        else
                          return W.errors = [
                            {
                              instancePath: t + "/constants",
                              schemaPath: "#/properties/constants/type",
                              keyword: "type",
                              params: {
                                type: "object"
                              },
                              message: "must be object"
                            }
                          ], !1;
                      var d = E === e;
                    } else
                      var d = !0;
                    if (d) {
                      if (r.plugins !== void 0) {
                        let l = r.plugins;
                        const E = e;
                        if (e === E)
                          if (Array.isArray(l)) {
                            var U = !0;
                            const k = l.length;
                            for (let g = 0; g < k; g++) {
                              let m = l[g];
                              const y = e, h = e;
                              let w = !1;
                              const L = e;
                              if (typeof m != "string") {
                                const x = {
                                  instancePath: t + "/plugins/" + g,
                                  schemaPath: "#/properties/plugins/items/anyOf/0/type",
                                  keyword: "type",
                                  params: {
                                    type: "string"
                                  },
                                  message: "must be string"
                                };
                                i === null ? i = [
                                  x
                                ] : i.push(
                                  x
                                ), e++;
                              }
                              var b = L === e;
                              if (w = w || b, !w) {
                                const x = e;
                                re(
                                  m,
                                  {
                                    instancePath: t + "/plugins/" + g,
                                    parentData: l,
                                    parentDataProperty: g,
                                    rootData: u
                                  }
                                ) || (i = i === null ? re.errors : i.concat(
                                  re.errors
                                ), e = i.length);
                                var b = x === e;
                                w = w || b;
                              }
                              if (w)
                                e = h, i !== null && (h ? i.length = h : i = null);
                              else {
                                const x = {
                                  instancePath: t + "/plugins/" + g,
                                  schemaPath: "#/properties/plugins/items/anyOf",
                                  keyword: "anyOf",
                                  params: {},
                                  message: "must match a schema in anyOf"
                                };
                                return i === null ? i = [
                                  x
                                ] : i.push(
                                  x
                                ), e++, W.errors = i, !1;
                              }
                              var U = y === e;
                              if (!U)
                                break;
                            }
                          } else
                            return W.errors = [
                              {
                                instancePath: t + "/plugins",
                                schemaPath: "#/properties/plugins/type",
                                keyword: "type",
                                params: {
                                  type: "array"
                                },
                                message: "must be array"
                              }
                            ], !1;
                        var d = E === e;
                      } else
                        var d = !0;
                      if (d) {
                        if (r.siteOptions !== void 0) {
                          let l = r.siteOptions;
                          const E = e;
                          if (e === E)
                            if (l && typeof l == "object" && !Array.isArray(
                              l
                            )) {
                              const k = e;
                              for (const g in l)
                                if (g !== "blogname") {
                                  const m = e;
                                  if (typeof l[g] != "string")
                                    return W.errors = [
                                      {
                                        instancePath: t + "/siteOptions/" + g.replace(
                                          /~/g,
                                          "~0"
                                        ).replace(
                                          /\//g,
                                          "~1"
                                        ),
                                        schemaPath: "#/properties/siteOptions/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                          type: "string"
                                        },
                                        message: "must be string"
                                      }
                                    ], !1;
                                  var D = m === e;
                                  if (!D)
                                    break;
                                }
                              if (k === e && l.blogname !== void 0 && typeof l.blogname != "string")
                                return W.errors = [
                                  {
                                    instancePath: t + "/siteOptions/blogname",
                                    schemaPath: "#/properties/siteOptions/properties/blogname/type",
                                    keyword: "type",
                                    params: {
                                      type: "string"
                                    },
                                    message: "must be string"
                                  }
                                ], !1;
                            } else
                              return W.errors = [
                                {
                                  instancePath: t + "/siteOptions",
                                  schemaPath: "#/properties/siteOptions/type",
                                  keyword: "type",
                                  params: {
                                    type: "object"
                                  },
                                  message: "must be object"
                                }
                              ], !1;
                          var d = E === e;
                        } else
                          var d = !0;
                        if (d) {
                          if (r.login !== void 0) {
                            let l = r.login;
                            const E = e, _ = e;
                            let k = !1;
                            const g = e;
                            if (typeof l != "boolean") {
                              const y = {
                                instancePath: t + "/login",
                                schemaPath: "#/properties/login/anyOf/0/type",
                                keyword: "type",
                                params: {
                                  type: "boolean"
                                },
                                message: "must be boolean"
                              };
                              i === null ? i = [
                                y
                              ] : i.push(
                                y
                              ), e++;
                            }
                            var te = g === e;
                            if (k = k || te, !k) {
                              const y = e;
                              if (e === y)
                                if (l && typeof l == "object" && !Array.isArray(
                                  l
                                )) {
                                  let w;
                                  if (l.username === void 0 && (w = "username") || l.password === void 0 && (w = "password")) {
                                    const L = {
                                      instancePath: t + "/login",
                                      schemaPath: "#/properties/login/anyOf/1/required",
                                      keyword: "required",
                                      params: {
                                        missingProperty: w
                                      },
                                      message: "must have required property '" + w + "'"
                                    };
                                    i === null ? i = [
                                      L
                                    ] : i.push(
                                      L
                                    ), e++;
                                  } else {
                                    const L = e;
                                    for (const T in l)
                                      if (!(T === "username" || T === "password")) {
                                        const x = {
                                          instancePath: t + "/login",
                                          schemaPath: "#/properties/login/anyOf/1/additionalProperties",
                                          keyword: "additionalProperties",
                                          params: {
                                            additionalProperty: T
                                          },
                                          message: "must NOT have additional properties"
                                        };
                                        i === null ? i = [
                                          x
                                        ] : i.push(
                                          x
                                        ), e++;
                                        break;
                                      }
                                    if (L === e) {
                                      if (l.username !== void 0) {
                                        const T = e;
                                        if (typeof l.username != "string") {
                                          const x = {
                                            instancePath: t + "/login/username",
                                            schemaPath: "#/properties/login/anyOf/1/properties/username/type",
                                            keyword: "type",
                                            params: {
                                              type: "string"
                                            },
                                            message: "must be string"
                                          };
                                          i === null ? i = [
                                            x
                                          ] : i.push(
                                            x
                                          ), e++;
                                        }
                                        var H = T === e;
                                      } else
                                        var H = !0;
                                      if (H)
                                        if (l.password !== void 0) {
                                          const T = e;
                                          if (typeof l.password != "string") {
                                            const j = {
                                              instancePath: t + "/login/password",
                                              schemaPath: "#/properties/login/anyOf/1/properties/password/type",
                                              keyword: "type",
                                              params: {
                                                type: "string"
                                              },
                                              message: "must be string"
                                            };
                                            i === null ? i = [
                                              j
                                            ] : i.push(
                                              j
                                            ), e++;
                                          }
                                          var H = T === e;
                                        } else
                                          var H = !0;
                                    }
                                  }
                                } else {
                                  const w = {
                                    instancePath: t + "/login",
                                    schemaPath: "#/properties/login/anyOf/1/type",
                                    keyword: "type",
                                    params: {
                                      type: "object"
                                    },
                                    message: "must be object"
                                  };
                                  i === null ? i = [
                                    w
                                  ] : i.push(
                                    w
                                  ), e++;
                                }
                              var te = y === e;
                              k = k || te;
                            }
                            if (k)
                              e = _, i !== null && (_ ? i.length = _ : i = null);
                            else {
                              const y = {
                                instancePath: t + "/login",
                                schemaPath: "#/properties/login/anyOf",
                                keyword: "anyOf",
                                params: {},
                                message: "must match a schema in anyOf"
                              };
                              return i === null ? i = [
                                y
                              ] : i.push(
                                y
                              ), e++, W.errors = i, !1;
                            }
                            var d = E === e;
                          } else
                            var d = !0;
                          if (d) {
                            if (r.phpExtensionBundles !== void 0) {
                              let l = r.phpExtensionBundles;
                              const E = e;
                              if (e === E)
                                if (Array.isArray(
                                  l
                                )) {
                                  var P = !0;
                                  const k = l.length;
                                  for (let g = 0; g < k; g++) {
                                    let m = l[g];
                                    const y = e;
                                    if (typeof m != "string")
                                      return W.errors = [
                                        {
                                          instancePath: t + "/phpExtensionBundles/" + g,
                                          schemaPath: "#/definitions/SupportedPHPExtensionBundle/type",
                                          keyword: "type",
                                          params: {
                                            type: "string"
                                          },
                                          message: "must be string"
                                        }
                                      ], !1;
                                    if (!(m === "kitchen-sink" || m === "light"))
                                      return W.errors = [
                                        {
                                          instancePath: t + "/phpExtensionBundles/" + g,
                                          schemaPath: "#/definitions/SupportedPHPExtensionBundle/enum",
                                          keyword: "enum",
                                          params: {
                                            allowedValues: gt.enum
                                          },
                                          message: "must be equal to one of the allowed values"
                                        }
                                      ], !1;
                                    var P = y === e;
                                    if (!P)
                                      break;
                                  }
                                } else
                                  return W.errors = [
                                    {
                                      instancePath: t + "/phpExtensionBundles",
                                      schemaPath: "#/properties/phpExtensionBundles/type",
                                      keyword: "type",
                                      params: {
                                        type: "array"
                                      },
                                      message: "must be array"
                                    }
                                  ], !1;
                              var d = E === e;
                            } else
                              var d = !0;
                            if (d) {
                              if (r.steps !== void 0) {
                                let l = r.steps;
                                const E = e;
                                if (e === E)
                                  if (Array.isArray(
                                    l
                                  )) {
                                    var A = !0;
                                    const k = l.length;
                                    for (let g = 0; g < k; g++) {
                                      let m = l[g];
                                      const y = e, h = e;
                                      let w = !1;
                                      const L = e;
                                      o(
                                        m,
                                        {
                                          instancePath: t + "/steps/" + g,
                                          parentData: l,
                                          parentDataProperty: g,
                                          rootData: u
                                        }
                                      ) || (i = i === null ? o.errors : i.concat(
                                        o.errors
                                      ), e = i.length);
                                      var F = L === e;
                                      if (w = w || F, !w) {
                                        const x = e;
                                        if (typeof m != "string") {
                                          const V = {
                                            instancePath: t + "/steps/" + g,
                                            schemaPath: "#/properties/steps/items/anyOf/1/type",
                                            keyword: "type",
                                            params: {
                                              type: "string"
                                            },
                                            message: "must be string"
                                          };
                                          i === null ? i = [
                                            V
                                          ] : i.push(
                                            V
                                          ), e++;
                                        }
                                        var F = x === e;
                                        if (w = w || F, !w) {
                                          const V = e, ee = {
                                            instancePath: t + "/steps/" + g,
                                            schemaPath: "#/properties/steps/items/anyOf/2/not",
                                            keyword: "not",
                                            params: {},
                                            message: "must NOT be valid"
                                          };
                                          i === null ? i = [
                                            ee
                                          ] : i.push(
                                            ee
                                          ), e++;
                                          var F = V === e;
                                          if (w = w || F, !w) {
                                            const N = e;
                                            if (typeof m != "boolean") {
                                              const C = {
                                                instancePath: t + "/steps/" + g,
                                                schemaPath: "#/properties/steps/items/anyOf/3/type",
                                                keyword: "type",
                                                params: {
                                                  type: "boolean"
                                                },
                                                message: "must be boolean"
                                              };
                                              i === null ? i = [
                                                C
                                              ] : i.push(
                                                C
                                              ), e++;
                                            }
                                            if (m !== !1) {
                                              const C = {
                                                instancePath: t + "/steps/" + g,
                                                schemaPath: "#/properties/steps/items/anyOf/3/const",
                                                keyword: "const",
                                                params: {
                                                  allowedValue: !1
                                                },
                                                message: "must be equal to constant"
                                              };
                                              i === null ? i = [
                                                C
                                              ] : i.push(
                                                C
                                              ), e++;
                                            }
                                            var F = N === e;
                                            if (w = w || F, !w) {
                                              const C = e;
                                              if (m !== null) {
                                                const J = {
                                                  instancePath: t + "/steps/" + g,
                                                  schemaPath: "#/properties/steps/items/anyOf/4/type",
                                                  keyword: "type",
                                                  params: {
                                                    type: "null"
                                                  },
                                                  message: "must be null"
                                                };
                                                i === null ? i = [
                                                  J
                                                ] : i.push(
                                                  J
                                                ), e++;
                                              }
                                              var F = C === e;
                                              w = w || F;
                                            }
                                          }
                                        }
                                      }
                                      if (w)
                                        e = h, i !== null && (h ? i.length = h : i = null);
                                      else {
                                        const x = {
                                          instancePath: t + "/steps/" + g,
                                          schemaPath: "#/properties/steps/items/anyOf",
                                          keyword: "anyOf",
                                          params: {},
                                          message: "must match a schema in anyOf"
                                        };
                                        return i === null ? i = [
                                          x
                                        ] : i.push(
                                          x
                                        ), e++, W.errors = i, !1;
                                      }
                                      var A = y === e;
                                      if (!A)
                                        break;
                                    }
                                  } else
                                    return W.errors = [
                                      {
                                        instancePath: t + "/steps",
                                        schemaPath: "#/properties/steps/type",
                                        keyword: "type",
                                        params: {
                                          type: "array"
                                        },
                                        message: "must be array"
                                      }
                                    ], !1;
                                var d = E === e;
                              } else
                                var d = !0;
                              if (d)
                                if (r.$schema !== void 0) {
                                  const l = e;
                                  if (typeof r.$schema != "string")
                                    return W.errors = [
                                      {
                                        instancePath: t + "/$schema",
                                        schemaPath: "#/properties/%24schema/type",
                                        keyword: "type",
                                        params: {
                                          type: "string"
                                        },
                                        message: "must be string"
                                      }
                                    ], !1;
                                  var d = l === e;
                                } else
                                  var d = !0;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else
      return W.errors = [
        {
          instancePath: t,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
      ], !1;
  return W.errors = i, e === 0;
}
function ze(r, { instancePath: t = "", parentData: f, parentDataProperty: c, rootData: u = r } = {}) {
  let i = null, e = 0;
  return W(r, {
    instancePath: t,
    parentData: f,
    parentDataProperty: c,
    rootData: u
  }) || (i = i === null ? W.errors : i.concat(W.errors), e = i.length), ze.errors = i, e === 0;
}
const { wpCLI: wt, ...or } = it, vt = {
  ...or,
  "wp-cli": wt,
  importFile: or.importWxr
};
function Ft(r, {
  progress: t = new jr(),
  semaphore: f = new Or({ concurrency: 3 }),
  onStepCompleted: c = () => {
  }
} = {}) {
  var v, R, M, U, b, D, te, H, P;
  r = {
    ...r,
    steps: (r.steps || []).filter(Ot).filter($t)
  };
  for (const A of r.steps)
    typeof A == "object" && A.step === "importFile" && (A.step = "importWxr", me.warn(
      'The "importFile" step is deprecated. Use "importWxr" instead.'
    ));
  if (r.constants && r.steps.unshift({
    step: "defineWpConfigConsts",
    consts: r.constants
  }), r.siteOptions && r.steps.unshift({
    step: "setSiteOptions",
    options: r.siteOptions
  }), r.plugins) {
    const A = r.plugins.map((F) => typeof F == "string" ? F.startsWith("https://") ? {
      resource: "url",
      url: F
    } : {
      resource: "wordpress.org/plugins",
      slug: F
    } : F).map((F) => ({
      step: "installPlugin",
      pluginZipFile: F
    }));
    r.steps.unshift(...A);
  }
  r.login && r.steps.push({
    step: "login",
    ...r.login === !0 ? { username: "admin", password: "password" } : r.login
  }), r.phpExtensionBundles || (r.phpExtensionBundles = []), r.phpExtensionBundles || (r.phpExtensionBundles = []), r.phpExtensionBundles.length === 0 && r.phpExtensionBundles.push("kitchen-sink");
  const u = ((v = r.steps) == null ? void 0 : v.findIndex(
    (A) => typeof A == "object" && (A == null ? void 0 : A.step) === "wp-cli"
  )) ?? -1;
  if ((R = r == null ? void 0 : r.extraLibraries) != null && R.includes("wp-cli") || u > -1) {
    r.phpExtensionBundles.includes("light") && (r.phpExtensionBundles = r.phpExtensionBundles.filter(
      (F) => F !== "light"
    ), me.warn(
      "WP-CLI is used in your Blueprint, and it requires the iconv and mbstring PHP extensions. However, you did not specify the kitchen-sink extension bundle. Playground will override your choice and load the kitchen-sink PHP extensions bundle to prevent the WP-CLI step from failing. "
    ));
    const A = {
      step: "writeFile",
      data: {
        resource: "url",
        /**
         * Use compression for downloading the wp-cli.phar file.
         * The official release, hosted at raw.githubusercontent.com, is ~7MB
         * and the transfer is uncompressed. playground.wordpress.net supports
         * transfer compression and only transmits ~1.4MB.
         *
         * @TODO: minify the wp-cli.phar file. It can be as small as 1MB when all the
         *        whitespaces and are removed, and even 500KB when libraries
         *        like the JavaScript parser or Composer are removed.
         */
        url: "https://playground.wordpress.net/wp-cli.phar"
      },
      path: "/tmp/wp-cli.phar"
    };
    u === -1 ? (M = r.steps) == null || M.push(A) : (U = r.steps) == null || U.splice(u, 0, A);
  }
  const i = (b = r.steps) == null ? void 0 : b.findIndex(
    (A) => typeof A == "object" && (A == null ? void 0 : A.step) === "importWxr"
  );
  i !== void 0 && i > -1 && (r.phpExtensionBundles.includes("light") && (r.phpExtensionBundles = r.phpExtensionBundles.filter(
    (A) => A !== "light"
  ), me.warn(
    "The importWxr step used in your Blueprint requires the iconv and mbstring PHP extensions. However, you did not specify the kitchen-sink extension bundle. Playground will override your choice and load the kitchen-sink PHP extensions bundle to prevent the WP-CLI step from failing. "
  )), (D = r.steps) == null || D.splice(i, 0, {
    step: "installPlugin",
    pluginZipFile: {
      resource: "url",
      url: "https://playground.wordpress.net/wordpress-importer.zip",
      caption: "Downloading the WordPress Importer plugin"
    }
  }));
  const { valid: e, errors: d } = Pt(r);
  if (!e) {
    const A = new Error(
      `Invalid blueprint: ${d[0].message} at ${d[0].instancePath}`
    );
    throw A.errors = d, A;
  }
  const O = r.steps || [], B = O.reduce(
    (A, F) => {
      var z;
      return A + (((z = F.progress) == null ? void 0 : z.weight) || 1);
    },
    0
  ), I = O.map(
    (A) => Et(A, {
      semaphore: f,
      rootProgressTracker: t,
      totalProgressWeight: B
    })
  );
  return {
    versions: {
      php: _t(
        (te = r.preferredVersions) == null ? void 0 : te.php,
        Rr,
        Ar
      ),
      wp: ((H = r.preferredVersions) == null ? void 0 : H.wp) || "latest"
    },
    phpExtensions: kt(
      [],
      r.phpExtensionBundles || []
    ),
    features: {
      // Disable networking by default
      networking: ((P = r.features) == null ? void 0 : P.networking) ?? !1
    },
    extraLibraries: r.extraLibraries || [],
    run: async (A) => {
      try {
        for (const { resources: F } of I)
          for (const z of F)
            z.setPlayground(A), z.isAsync && z.resolve();
        for (const [F, { run: z, step: l }] of Object.entries(I))
          try {
            const E = await z(A);
            c(E, l);
          } catch (E) {
            throw me.error(E), new Error(
              `Error when executing the blueprint step #${F} (${JSON.stringify(
                l
              )}) ${E instanceof Error ? `: ${E.message}` : E}`,
              { cause: E }
            );
          }
      } finally {
        try {
          await A.goTo(
            r.landingPage || "/"
          );
        } catch {
        }
        t.finish();
      }
    }
  };
}
function Pt(r) {
  var u;
  const t = ze(r);
  if (t)
    return { valid: t };
  const f = /* @__PURE__ */ new Set();
  for (const i of ze.errors)
    i.schemaPath.startsWith("#/properties/steps/items/anyOf") || f.add(i.instancePath);
  const c = (u = ze.errors) == null ? void 0 : u.filter(
    (i) => !(i.schemaPath.startsWith("#/properties/steps/items/anyOf") && f.has(i.instancePath))
  );
  return {
    valid: t,
    errors: c
  };
}
function _t(r, t, f) {
  return r && t.includes(r) ? r : f;
}
function kt(r, t) {
  const f = qr.filter(
    (u) => r.includes(u)
  ), c = t.flatMap(
    (u) => u in sr ? sr[u] : []
  );
  return Array.from(/* @__PURE__ */ new Set([...f, ...c]));
}
function Ot(r) {
  return !!(typeof r == "object" && r);
}
function $t(r) {
  return ["setPhpIniEntry", "request"].includes(r.step) ? (me.warn(
    `The "${r.step}" Blueprint is no longer supported and you can remove it from your Blueprint.`
  ), !1) : !0;
}
function Et(r, {
  semaphore: t,
  rootProgressTracker: f,
  totalProgressWeight: c
}) {
  var I;
  const u = f.stage(
    (((I = r.progress) == null ? void 0 : I.weight) || 1) / c
  ), i = {};
  for (const v of Object.keys(r)) {
    let R = r[v];
    nt(R) && (R = Ee.create(R, {
      semaphore: t
    })), i[v] = R;
  }
  const e = async (v) => {
    var R;
    try {
      return u.fillSlowly(), await vt[r.step](
        v,
        await Tt(i),
        {
          tracker: u,
          initialCaption: (R = r.progress) == null ? void 0 : R.caption
        }
      );
    } finally {
      u.finish();
    }
  }, d = nr(i), O = nr(i).filter(
    (v) => v.isAsync
  ), B = 1 / (O.length + 1);
  for (const v of O)
    v.progress = u.stage(B);
  return { run: e, step: r, resources: d };
}
function nr(r) {
  const t = [];
  for (const f in r) {
    const c = r[f];
    c instanceof Ee && t.push(c);
  }
  return t;
}
async function Tt(r) {
  const t = {};
  for (const f in r) {
    const c = r[f];
    c instanceof Ee ? t[f] = await c.resolve() : t[f] = c;
  }
  return t;
}
async function xt(r, t) {
  await r.run(t);
}
function Ct() {
}
export {
  Ke as activatePlugin,
  fr as activateTheme,
  Ft as compileBlueprint,
  Br as cp,
  cr as defineSiteUrl,
  Ve as defineWpConfigConsts,
  Ur as enableMultisite,
  Gr as exportWXR,
  mr as importThemeStarterContent,
  Hr as importWordPressFiles,
  Vr as importWxr,
  Yr as installPlugin,
  Zr as installTheme,
  Xe as login,
  Mr as mkdir,
  Dr as mv,
  Qe as request,
  Qr as resetData,
  lr as rm,
  zr as rmdir,
  xt as runBlueprintSteps,
  Lr as runPHP,
  Sr as runPHPWithOptions,
  Nr as runSql,
  Xr as runWpInstallationWizard,
  Ct as setPluginProxyURL,
  st as setSiteLanguage,
  dr as setSiteOptions,
  er as unzip,
  Ir as updateUserMeta,
  rt as wpCLI,
  pr as wpContentFilesExcludedFromExport,
  ur as writeFile,
  Jr as zipWpContent
};
