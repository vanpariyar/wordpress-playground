import { ProgressTracker } from '@php-wasm/progress';
import { Semaphore } from '@php-wasm/util';
import { SupportedPHPExtension, SupportedPHPVersion, UniversalPHP } from '@php-wasm/universal';
import { StepDefinition } from './steps';
import { Blueprint, ExtraLibrary } from './blueprint';
export type CompiledStep = (php: UniversalPHP) => Promise<void> | void;
export interface CompiledBlueprint {
    /** The requested versions of PHP and WordPress for the blueprint */
    versions: {
        php: SupportedPHPVersion;
        wp: string;
    };
    /** The requested PHP extensions to load */
    phpExtensions: SupportedPHPExtension[];
    features: {
        /** Should boot with support for network request via wp_safe_remote_get? */
        networking: boolean;
    };
    extraLibraries: ExtraLibrary[];
    /** The compiled steps for the blueprint */
    run: (playground: UniversalPHP) => Promise<void>;
}
export type OnStepCompleted = (output: any, step: StepDefinition) => any;
export interface CompileBlueprintOptions {
    /** Optional progress tracker to monitor progress */
    progress?: ProgressTracker;
    /** Optional semaphore to control access to a shared resource */
    semaphore?: Semaphore;
    /** Optional callback with step output */
    onStepCompleted?: OnStepCompleted;
}
/**
 * Compiles Blueprint into a form that can be executed.
 *
 * @param playground The PlaygroundClient to use for the compilation
 * @param blueprint The bBueprint to compile
 * @param options Additional options for the compilation
 * @returns The compiled blueprint
 */
export declare function compileBlueprint(blueprint: Blueprint, { progress, semaphore, onStepCompleted, }?: CompileBlueprintOptions): CompiledBlueprint;
export declare function validateBlueprint(blueprintMaybe: object): {
    valid: true;
    errors?: undefined;
} | {
    valid: false;
    errors: import("ajv").ErrorObject<string, Record<string, any>, unknown>[] | undefined;
};
export declare function runBlueprintSteps(compiledBlueprint: CompiledBlueprint, playground: UniversalPHP): Promise<void>;
