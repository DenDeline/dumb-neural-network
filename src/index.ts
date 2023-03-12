import { Greed } from './greed'
import { IMessage } from './Interfaces'

const neuralNetworkWorker = new Worker(new URL('./neuralNetworkWorker.ts', import.meta.url))

function init(){
    const  greed = new Greed(3, 3)
    greed.render()

    const greedSection = document.getElementById('drawer') as HTMLDivElement
    greedSection.appendChild(greed.rawHtml)

    const learningButton =  document.getElementById('learning-button') as HTMLInputElement
    learningButton.addEventListener('click',  () => {
        neuralNetworkWorker.postMessage({ action: 'training' })
    })

    const resetButton = document.getElementById('reset') as HTMLButtonElement
    resetButton.addEventListener('click', () => {
        greed.reset()
        const output = greed.toNumberArray()
        neuralNetworkWorker.postMessage({ action: 'predict', payload: output })
    })

    const resultButton = document.getElementById('result-button') as HTMLButtonElement
    resultButton.addEventListener('click',  () => {
        const output = greed.toNumberArray()
        neuralNetworkWorker.postMessage({ action: 'predict', payload: output })
    })

    neuralNetworkWorker.onmessage = (e: MessageEvent<IMessage>) => {
        if (e.data.action === 'prediction_result') {
            const [isHorizontal, isVertical] = e.data.payload as boolean[]

            let resultSpan = document.getElementById('neural-network-result') as HTMLSpanElement
            resultSpan.replaceChildren()
            if (isHorizontal || isVertical) {
                resultSpan.insertAdjacentText('afterbegin', [
                    isHorizontal && 'Horizontal',
                    isHorizontal && isVertical && 'and',
                    isVertical && 'Vertical'
                ]
                    .filter(Boolean)
                    .join(' '))
            } else {
                resultSpan.insertAdjacentText('afterbegin', 'None ')
            }

        } else {
            const { learningError, epoch } = e.data.payload

            const errorSpan = document.getElementById('neural-network-error') as HTMLSpanElement
            errorSpan.replaceChildren()
            errorSpan.insertAdjacentText('afterbegin', learningError.toPrecision(4).toString())

            const epochSpan = document.getElementById('neural-network-epoch') as HTMLSpanElement
            epochSpan.replaceChildren()
            epochSpan.insertAdjacentText('afterbegin', epoch.toString())

            const output = greed.toNumberArray()
            neuralNetworkWorker.postMessage({ action: 'predict', payload: output })
        }
    }

    const output = greed.toNumberArray()
    neuralNetworkWorker.postMessage({ action: 'predict', payload: output })
}

init()
