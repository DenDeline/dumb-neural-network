import { BaseHtmlElement } from './baseHtmlElement'
import { GreedCell } from './greedCell'

export class GreedRow extends BaseHtmlElement {
    protected _htmlElement!: HTMLTableRowElement
    protected _childElements: GreedCell[] = []

    constructor(public width: number) {
        super()
        this.initState()
        this.render()
    }

    protected initState() {
        for (let i = 0; i < this.width; i++) {
            let greedCell = new GreedCell()
            this.appendChild(greedCell)
        }
    }

    public render() {
        let htmlElement = document.createElement('tr')
        htmlElement.classList.add(...this._htmlClassList.rawClassList)
        this._htmlElement = htmlElement

        for (let i = 0; i < this.width; i++) {
            let childElement = this._childElements[i]
            childElement.render()
            this.appendChildHtml(childElement.rawHtml)
        }
    }

    public reset() {
        for (let i = 0; i < this.width; i++) {
            this._childElements[i].reset()
        }
    }

    public toNumberArray() {
        let output: number[] = []
        for (let i = 0; i < this.width; i++) {
            output.push(this._childElements[i].toNumberArray())
        }
        return output
    }

    public inputDataset(dataset: number[]) {
        for (let i = 0; i < this.width; i++) {
            this._childElements[i].inputDataset(dataset[i])
        }
    }
}
