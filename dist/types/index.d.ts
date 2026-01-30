interface ShowMoreOptions {
    typeElement: string;
    more: string | false;
    less: string | false;
    number: boolean;
    nobutton: boolean;
    after: number;
    btnClass: string;
    btnClassAppend: string | null;
    limit?: number;
    type?: "text" | "list" | "table";
    element?: HTMLElement;
    ellipsis?: boolean | string;
}

interface RegexRule {
    match: RegExp;
    replace: string;
}
interface RegexConfig {
    newLine?: RegexRule;
    space?: RegexRule;
    br?: RegexRule;
    html?: RegexRule;
    [key: string]: RegexRule | undefined;
}

interface ShowMoreConfig {
    onMoreLess?: (action: string, object: ShowMoreInternalObject) => void;
    regex?: RegexConfig;
    config?: Partial<ShowMoreOptions>;
}
interface ShowMoreInternalObject extends ShowMoreOptions {
    index: number;
    classArray: DOMTokenList;
    element: HTMLElement;
    originalText?: string;
    truncatedText?: string;
    target?: EventTarget;
}
/**
 * ShowMore - JavaScript library that truncates text, list or table by chars, elements or rows
 */
declare class ShowMore {
    private _onMoreLess;
    private _regex;
    private _object;
    private _checkExp;
    /**
     * Constructor
     *
     * @param className - CSS selector for elements
     * @param config - Configuration object
     */
    constructor(className: string, config?: ShowMoreConfig);
    /**
     * Initial function
     */
    private _initial;
    /**
     * Event click
     *
     * @param element - HTMLElement to attach event to
     * @param object - Configuration object
     */
    private _clickEvent;
    /**
     * Create button
     *
     * @param config - Configuration object
     * @returns HTMLButtonElement
     */
    private _createBtn;
    /**
     * Event handler
     *
     * @param object - Configuration object
     * @param event - Mouse event
     */
    private _handleEvent;
    /**
     * Get number count based on type
     */
    private _getNumberCount;
    /**
     * Add button
     *
     * @param object - Configuration object
     */
    private _addBtn;
    /**
     * Set aria-expanded
     *
     * @param object - Configuration object with target
     */
    private _setExpand;
}

export { ShowMore as default };
