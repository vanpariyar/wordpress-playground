import { addProjectConfiguration, formatFiles, generateFiles, getWorkspaceLayout, names, offsetFromRoot, } from '@nx/devkit';
import * as path from 'path';
function normalizeOptions(tree, options) {
    const name = names(options.name).fileName;
    const projectDirectory = options.directory
        ? `${names(options.directory).fileName}/${name}`
        : name;
    const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
    const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    return {
        ...options,
        projectName,
        projectRoot,
        projectDirectory,
        parsedTags,
    };
}
function addFiles(tree, options) {
    const templateOptions = {
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(options.projectRoot),
        template: '',
    };
    generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
}
export default async function (tree, options) {
    const normalizedOptions = normalizeOptions(tree, options);
    addProjectConfiguration(tree, normalizedOptions.projectName, {
        root: normalizedOptions.projectRoot,
        projectType: 'library',
        sourceRoot: `${normalizedOptions.projectRoot}/src`,
        targets: {
            build: {
                executor: '@wp-playground/nx-extensions:build',
            },
        },
        tags: normalizedOptions.parsedTags,
    });
    addFiles(tree, normalizedOptions);
    await formatFiles(tree);
}
//# sourceMappingURL=generator.js.map