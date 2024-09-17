function s(e){return`json_decode(base64_decode('${$(JSON.stringify(e))}'), true)`}function a(e){const t={};for(const i in e)t[i]=s(e[i]);return t}function $(e){return f(new TextEncoder().encode(e))}function f(e){const t=String.fromCodePoint(...e);return btoa(t)}const l="8.0",n="/tmp/file.zip",u=async(e,t,i,o=!0)=>{if(t instanceof File){const c=t;t=n,await e.writeFile(t,new Uint8Array(await c.arrayBuffer()))}const r=a({zipPath:t,extractToPath:i,overwriteFiles:o});await e.run({code:`<?php
        function unzip($zipPath, $extractTo, $overwriteFiles = true)
        {
            if (!is_dir($extractTo)) {
                mkdir($extractTo, 0777, true);
            }
            $zip = new ZipArchive;
            $res = $zip->open($zipPath);
            if ($res === TRUE) {
				for ($i = 0; $i < $zip->numFiles; $i++) {
					$filename = $zip->getNameIndex($i);
					$fileinfo = pathinfo($filename);
					$extractFilePath = rtrim($extractTo, '/') . '/' . $filename;
					// Check if file exists and $overwriteFiles is false
					if (!file_exists($extractFilePath) || $overwriteFiles) {
						// Extract file
						$zip->extractTo($extractTo, $filename);
					}
				}
				$zip->close();
				chmod($extractTo, 0777);
            } else {
                throw new Exception("Could not unzip file");
            }
        }
        unzip(${r.zipPath}, ${r.extractToPath}, ${r.overwriteFiles});
        `}),await e.fileExists(n)&&await e.unlink(n)},p=async(e,t)=>{const i=`/tmp/file${Math.random()}.zip`,o=a({directoryPath:t,outputPath:i});await e.run({code:`<?php
		function zipDirectory($directoryPath, $outputPath) {
			$zip = new ZipArchive;
			$res = $zip->open($outputPath, ZipArchive::CREATE);
			if ($res !== TRUE) {
				throw new Exception('Failed to create ZIP');
			}
			$files = new RecursiveIteratorIterator(
				new RecursiveDirectoryIterator($directoryPath)
			);
			foreach ($files as $file) {
				$file = strval($file);
				if (is_dir($file)) {
					continue;
				}
				$zip->addFile($file, substr($file, strlen($directoryPath)));
			}
			$zip->close();
			chmod($outputPath, 0777);
		}
		zipDirectory(${o.directoryPath}, ${o.outputPath});
		`});const r=await e.readFileAsBuffer(i);return e.unlink(i),r};export{l as RecommendedPHPVersion,u as unzipFile,p as zipDirectory};
