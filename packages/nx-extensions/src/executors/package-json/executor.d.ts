import { ExecutorContext } from '@nx/devkit';
import { PackageJsonExecutorSchema } from './schema';
interface ExecutorEvent {
    outfile: string;
    success: boolean;
}
export default function packageJsonExecutor(options: PackageJsonExecutorSchema, context: ExecutorContext): AsyncGenerator<ExecutorEvent, {
    success: boolean;
}, unknown>;
export {};
