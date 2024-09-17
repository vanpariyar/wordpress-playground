import { BuiltScriptExecutorSchema } from './schema';
export default function runExecutor(options: BuiltScriptExecutorSchema): Promise<{
    success: boolean;
}>;
