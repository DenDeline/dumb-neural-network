import { BaseHtmlElement } from './baseHtmlElement'

export class GreedCell extends BaseHtmlElement {
    private _solid: boolean = false
    protected _htmlElement!: HTMLTableDataCellElement

    constructor() {
        super()
        this.initState()
        this.render()
        this.handleGrag = this.handleGrag.bind(this)
    }

    private handleGrag() {
        this._solid = true
        this._htmlClassList.replace('cell', 'active-cell')
        this._htmlElement.classList.replace('cell', 'active-cell')
    }

    public initState() {
        this._htmlClassList.add('cell')
    }

    public render() {
        let htmlElement = document.createElement('td')
        htmlElement.classList.add(...this._htmlClassList.rawClassList)
        htmlElement.addEventListener('dragenter', this.handleGrag)
        this._htmlElement = htmlElement
    }

    public reset() {
        if (this._solid) {
            this._solid = false
            this._htmlClassList.replace('active-cell', 'cell')
            this._htmlElement.classList.replace('active-cell', 'cell')
        }
    }

    public toNumberArray() {
        return this._solid ? 1 : 0
    }

    public inputDataset(dataset: number) {
        this.reset()
        if (dataset == 1) {
            this._solid = true
            this._htmlClassList.replace('cell', 'active-cell')
            this._htmlElement.classList.replace('cell', 'active-cell')
        }
    }
}
