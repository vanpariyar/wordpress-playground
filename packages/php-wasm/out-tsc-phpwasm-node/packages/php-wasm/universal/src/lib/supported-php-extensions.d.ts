export type SupportedPHPExtension = 'iconv' | 'mbstring' | 'xml-bundle' | 'gd';
export declare const SupportedPHPExtensionsList: string[];
export declare const SupportedPHPExtensionBundles: {
    'kitchen-sink': string[];
    light: never[];
};
export type SupportedPHPExtensionBundle = 'kitchen-sink' | 'light';
