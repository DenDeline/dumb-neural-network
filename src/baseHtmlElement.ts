import { IHtmlElement } from './Interfaces'
import { HtmlClassList } from './htmlClassList'

export abstract class BaseHtmlElement implements IHtmlElement {
    protected _htmlElement!: HTMLElement
    protected _childElements: Array<IHtmlElement> = []
    protected _htmlClassList: HtmlClassList = new HtmlClassList()

    public abstract render(): void;

    protected abstract initState(): void;

    public get rawHtml() {
        return this._htmlElement
    }

    public appendChildHtml(childHtmlElement: HTMLElement) {
        this._htmlElement.appendChild(childHtmlElement)
    }

    public appendChild(childElement: BaseHtmlElement) {
        this._childElements.push(childElement)
    }
}
