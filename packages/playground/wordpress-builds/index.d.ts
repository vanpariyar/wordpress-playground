export { getWordPressModuleDetails } from './wordpress/get-wordpress-module-details';
export { getWordPressModule } from './wordpress/get-wordpress-module';
export * as sqliteDatabaseIntegrationModuleDetails from './sqlite-database-integration/get-sqlite-database-plugin-details';
export { getSqliteDatabaseModule } from './sqlite-database-integration/get-sqlite-database-module';
import MinifiedWordPressVersions from './wordpress/wp-versions.json';
export { MinifiedWordPressVersions };
export declare const MinifiedWordPressVersionsList: string[];
export declare const LatestMinifiedWordPressVersion: string;
export declare function wpVersionToStaticAssetsDirectory(wpVersion: string): string | undefined;
