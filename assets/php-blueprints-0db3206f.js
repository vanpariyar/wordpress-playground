import{s as p,g as l,j as a}from"./config-de61acb0.js";const u=document.querySelector("iframe"),e=await p({iframe:u,remoteUrl:l().toString(),blueprint:{preferredVersions:{wp:"latest",php:"8.2"},features:{networking:!0},landingPage:"/",phpExtensionBundles:["kitchen-sink"]}}),d=await fetch("./blueprints.phar"),c=new Uint8Array(await d.arrayBuffer());await e.writeFile(a(await e.documentRoot,"blueprints.phar"),c);const r=document.getElementById("output");try{const o=await(await fetch("https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar")).arrayBuffer();await e.writeFile("/wordpress/wp-cli.phar",new Uint8Array(o)),r.textContent+=`Running the Blueprint...
Live progress updates:
`,await e.onMessage(i=>{try{const t=JSON.parse(i);t.type==="progress"&&(r.textContent+=t.progress+"% "+(t.caption||"")+`
`)}catch(t){console.error(t)}});const n=await e.run({code:`<?php
		use WordPress\\Blueprints\\ContainerBuilder;
		use WordPress\\Blueprints\\Model\\BlueprintBuilder;
		use WordPress\\Blueprints\\Model\\DataClass\\Blueprint;
		use WordPress\\Blueprints\\Model\\DataClass\\UrlResource;
		use WordPress\\Blueprints\\Progress\\DoneEvent;
		use WordPress\\Blueprints\\Progress\\ProgressEvent;
		use Symfony\\Component\\EventDispatcher\\EventSubscriberInterface;
		use function WordPress\\Blueprints\\run_blueprint;

		// Provide stdin, stdout, stderr streams outside of
		// the CLI SAPI.
		define('STDIN', fopen('php://stdin', 'rb'));
		define('STDOUT', fopen('php://stdout', 'wb'));
		define('STDERR', fopen('/tmp/stderr', 'wb'));

		/*
		 * When the .phar file is build with this box option:
		 * > "check-requirements": false,
		 * Then requiring it breaks http and https requests:
		 *
		 * > echo file_get_contents('http://127.0.0.1:5400/website-server/');
		 * > <b>Warning</b>:  PHP Request Startup: Failed to open stream: Operation timed out in <b>php-wasm run script</b> on line <b>13</b><br />
		 *
		 * The check is therefore disabled for now.
		 */
		require '/wordpress/blueprints.phar';

		$blueprint = BlueprintBuilder::create()
			// This isn't a WordPress zip file since wordpress.org
			// doesn't expose the right CORS headers. It is a HTTPS-hosted
			// zip file nonetheless, and we can use it for testing.
			// Uncomment this as needed
			// ->setWordPressVersion( 'https://downloads.wordpress.org/plugin/hello-dolly.1.7.3.zip' )

			->withFile( 'wordpress.txt', (new UrlResource())->setUrl('https://downloads.wordpress.org/plugin/hello-dolly.zip') )
			->withSiteOptions( [
				'blogname' => 'My Playground Blog',
			] )
			->withWpConfigConstants( [
				'WP_DEBUG'         => true,
				'WP_DEBUG_LOG'     => true,
				'WP_DEBUG_DISPLAY' => true,
				'WP_CACHE'         => true,
			] )
			->withPlugins( [
				'https://downloads.wordpress.org/plugin/hello-dolly.zip',
				// When the regular UrlDataSource is used, the second
				// downloaded zip file always errors with:
				// > Failed to open stream: Operation timed out
				'https://downloads.wordpress.org/plugin/classic-editor.zip',
				'https://downloads.wordpress.org/plugin/gutenberg.17.7.0.zip',
			] )
			->withTheme( 'https://downloads.wordpress.org/theme/pendant.zip' )
			// ->withContent( 'https://raw.githubusercontent.com/WordPress/theme-test-data/master/themeunittestdata.wordpress.xml' )
			->andRunSQL( <<<'SQL'
				CREATE TABLE tmp_table ( id INT );
				INSERT INTO tmp_table VALUES (1);
				INSERT INTO tmp_table VALUES (2);
				SQL
			)
			->withFile( 'wordpress.txt', 'Data' )
			->toBlueprint()
		;

		echo "Running the following Blueprint:
";
		echo json_encode($blueprint, JSON_PRETTY_PRINT)."

";

		$subscriber = new class implements EventSubscriberInterface {
			public static function getSubscribedEvents() {
				return [
					ProgressEvent::class => 'onProgress',
					DoneEvent::class     => 'onDone',
				];
			}

			public function onProgress( ProgressEvent $event ) {
				post_message_to_js(json_encode([
					'type'    => 'progress',
					'caption'  => $event->caption,
					'progress' => $event->progress,
				]));
			}

			public function onDone( DoneEvent $event ) {
				post_message_to_js(json_encode([
					'type'    => 'progress',
					'progress' => 100,
				]));
			}
		};


		$results = run_blueprint(
			$blueprint,
			[
				'environment'        => ContainerBuilder::ENVIRONMENT_PLAYGROUND,
				'documentRoot'       => '/wordpress',
				'progressSubscriber' => $subscriber,
				'progressType'       => 'steps',
			]
		);

		echo "Blueprint execution finished!
";
		echo "Contents of /wordpress/wp-content/plugins:";
		print_r(glob('/wordpress/wp-content/plugins/*'));

		`});r.textContent+=n.text,console.log(n.text)}catch(s){throw console.error(s),r.textContent=s+"",s}console.log(await e.listFiles("/wordpress/wp-content/plugins"));
