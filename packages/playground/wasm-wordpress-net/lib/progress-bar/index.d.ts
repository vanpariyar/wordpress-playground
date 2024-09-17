export interface ProgressBarOptions {
    caption?: string;
    progress?: number;
    isIndefinite?: boolean;
    visible?: boolean;
}
declare class ProgressBar {
    element: HTMLDivElement;
    captionElement: HTMLHeadingElement;
    caption: string;
    progress: number;
    isIndefinite: boolean;
    visible: boolean;
    constructor(options?: ProgressBarOptions);
    setOptions(options: ProgressBarOptions): void;
    destroy(): void;
    updateElement(): void;
    createProgress(): HTMLDivElement;
    createProgressIndefinite(): HTMLDivElement;
}
export default ProgressBar;
