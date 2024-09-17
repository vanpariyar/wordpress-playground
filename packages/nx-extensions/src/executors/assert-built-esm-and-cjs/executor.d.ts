import { ExecutorContext } from '@nx/devkit';
import { AssertBuiltEsmAndCjsExecutorSchema } from './schema';
/**
 * Test whether a module can be imported as both ESM and CJS.
 *
 * @param options
 * @param context
 * @returns
 */
export default function runExecutor(options: AssertBuiltEsmAndCjsExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
