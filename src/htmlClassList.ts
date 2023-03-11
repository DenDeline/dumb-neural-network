export class HtmlClassList {
    private _classList: string[] = []

    constructor() {
    }

    public add(htmlClass: string) {
        if (this._classList.find((val) => val === htmlClass)) {
            return
        }
        this._classList.push(htmlClass)
    }

    public replace(oldClass: string, newClass: string) {
        let index = this._classList.findIndex((val) => val === oldClass)
        if (index !== -1) {
            this._classList[index] = newClass
        }
    }

    public get rawClassList() {
        return this._classList
    }
}
