import { PHPProcessManager, PHP } from '@php-wasm/universal';
export declare function spawnHandlerFactory(processManager: PHPProcessManager): any;
/**
 * Downloads and unzips a ZIP bundle of all the static assets removed from
 * the currently loaded minified WordPress build. Doesn't do anything if the
 * assets are already downloaded or if a non-minified WordPress build is loaded.
 *
 * ## Asset Loading
 *
 * To load Playground faster, we default to minified WordPress builds shipped
 * without most CSS files, JS files, and other static assets.
 *
 * When Playground requests a static asset that is not in the minified build, the service
 * worker consults the list of the assets removed during the minification process. Such
 * a list is shipped with every minified build in a file called `wordpress-remote-asset-paths`.
 *
 * For example, when `/wp-includes/css/dist/block-library/common.min.css` isn't found
 * in the Playground filesystem, the service worker looks for it in `/wordpress/wordpress-remote-asset-paths`
 * and finds it there. This means it's available on the remote server, so the service
 * worker fetches it from an URL like:
 *
 * https://playground.wordpress.net/wp-6.5/wp-includes/css/dist/block-library/common.min.css
 *
 * ## Assets backfilling
 *
 * Running Playground offline isn't possible without shipping all the static assets into the browser.
 * Downloading every CSS and JS file one request at a time would be slow to run and tedious to maintain.
 * This is where this function comes in!
 *
 * It downloads a zip archive containing all the static files removed from the currently running
 * minified build, and unzips them in the Playground filesystem. Once it finishes, the WordPress
 * installation running in the browser is complete and the service worker will no longer have
 * to backfill any static assets again.
 *
 * This process is started after the Playground boots (see `bootPlaygroundRemote`) and the first
 * page is rendered. This way we're not delaying the initial Playground paint with a large download.
 *
 * ## Prevent backfilling if assets are already available
 *
 * Running this function twice, or running it on a non-minified build will have no effect.
 *
 * The backfilling only runs when a non-empty `wordpress-remote-asset-paths` file
 * exists. When one is missing, we're not running a minified build. When one is empty,
 * it means the backfilling process was already done – this function empties the file
 * after the backfilling is done.
 *
 * ### Downloading assets during backfill
 *
 * Each WordPress release has a corresponding static assets directory on the Playground.WordPress.net server.
 * The file is downloaded from the server and unzipped into the WordPress document root.
 *
 * ### Skipping existing files during unzipping
 *
 * If any of the files already exist, they are skipped and not overwritten.
 * By skipping existing files, we ensure that the backfill process doesn't overwrite any user changes.
 */
export declare function backfillStaticFilesRemovedFromMinifiedBuild(php: PHP): Promise<void>;
export declare function hasCachedStaticFilesRemovedFromMinifiedBuild(php: PHP): Promise<boolean>;
/**
 * Returns the URL of the wordpress-static.zip file containing all the
 * static assets missing from the currently load minified build.
 *
 * Note: This function will produce a URL even if we're running a full
 *       production WordPress build.
 *
 * See backfillStaticFilesRemovedFromMinifiedBuild for more details.
 */
export declare function getWordPressStaticZipUrl(php: PHP): Promise<string | false>;
