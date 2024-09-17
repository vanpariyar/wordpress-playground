import { StepHandler } from '.';
/**
 * @inheritDoc setSiteLanguage
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "setSiteLanguage",
 * 		"language": "en_US"
 * }
 * </code>
 */
export interface SetSiteLanguageStep {
    step: 'setSiteLanguage';
    /** The language to set, e.g. 'en_US' */
    language: string;
}
/**
 * Sets the site language and download translations.
 */
export declare const setSiteLanguage: StepHandler<SetSiteLanguageStep>;
