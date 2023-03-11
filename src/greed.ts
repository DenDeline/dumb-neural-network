import { BaseHtmlElement } from './baseHtmlElement'
import { GreedRow } from './greedRow'

export class Greed extends BaseHtmlElement {
    protected _htmlElement!: HTMLTableElement
    protected _childElements: GreedRow[] = []

    constructor(public width: number, public height: number) {
        super()
        this.initState()
        this.render()
    }

    protected initState() {
        this._htmlClassList.add('greed')

        for (let i = 0; i < this.height; i++) {
            let greedRow = new GreedRow(this.width)
            this.appendChild(greedRow)
        }
    }

    public render() {
        let htmlElement = document.createElement('table')
        htmlElement.classList.add(...this._htmlClassList.rawClassList)
        this._htmlElement = htmlElement

        for (let i = 0; i < this.height; i++) {
            let childElement = this._childElements[i]
            childElement.render()
            this.appendChildHtml(childElement.rawHtml)
        }
    }

    public toNumberArray() {
        let output: number[] = []
        for (let i = 0; i < this.height; i++) {
            output = output.concat(this._childElements[i].toNumberArray())
        }
        return output
    }

    public reset() {
        for (let i = 0; i < this.height; i++) {
            this._childElements[i].reset()
        }
    }

    public inputDataset(data: number[][]) {
        for (let i = 0; i < this.height; i++) {
            this._childElements[i].inputDataset(data[i])
        }
    }
}
