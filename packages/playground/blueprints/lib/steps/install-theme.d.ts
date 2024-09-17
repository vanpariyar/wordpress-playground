import { StepHandler } from '.';
import { InstallAssetOptions } from './install-asset';
/**
 * @inheritDoc installTheme
 * @hasRunnableExample
 * @needsLogin
 * @example
 *
 * <code>
 * {
 * 		"step": "installTheme",
 * 		"themeZipFile": {
 * 			"resource": "wordpress.org/themes",
 * 			"slug": "pendant"
 * 		},
 * 		"options": {
 * 			"activate": true,
 * 			"importStarterContent": true
 * 		}
 * }
 * </code>
 */
export interface InstallThemeStep<ResourceType> extends Pick<InstallAssetOptions, 'ifAlreadyInstalled'> {
    /**
     * The step identifier.
     */
    step: 'installTheme';
    /**
     * The theme zip file to install.
     */
    themeZipFile: ResourceType;
    /**
     * Optional installation options.
     */
    options?: {
        /**
         * Whether to activate the theme after installing it.
         */
        activate?: boolean;
        /**
         * Whether to import the theme's starter content after installing it.
         */
        importStarterContent?: boolean;
    };
}
export interface InstallThemeOptions {
    /**
     * Whether to activate the theme after installing it.
     */
    activate?: boolean;
}
/**
 * Installs a WordPress theme in the Playground.
 *
 * @param playground The playground client.
 * @param themeZipFile The theme zip file.
 * @param options Optional. Set `activate` to false if you don't want to activate the theme.
 */
export declare const installTheme: StepHandler<InstallThemeStep<File>>;
