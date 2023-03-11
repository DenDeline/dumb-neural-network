import { Greed } from './greed'
import { IMessage } from './Interfaces'

const neuralNetworkWorker = new Worker(new URL('./neuralNetworkWorker.ts', import.meta.url))

function init(){
    const  greed = new Greed(3, 3)
    greed.render()
    const wrapper = document.getElementsByClassName('wrapper-cell').item(0)
    wrapper?.appendChild(greed.rawHtml)

    const learningButton =  document.getElementById('learning-button') as HTMLInputElement
    learningButton.addEventListener('click',  () => {
        neuralNetworkWorker.postMessage({ action: 'training' })
    })

    const resetButton = document.getElementById('reset') as HTMLButtonElement
    resetButton.addEventListener('click', () => greed.reset())

    const resultButton = document.getElementById('result-button') as HTMLButtonElement
    resultButton.addEventListener('click', async () => {
        let output = greed.toNumberArray()
        neuralNetworkWorker.postMessage({ action: 'predict', payload: output })
    })

    neuralNetworkWorker.onmessage = (e: MessageEvent<IMessage>) => {
        if (e.data.action === 'prediction_result') {
            let resultSpan = document.getElementById('neural-network-result') as HTMLSpanElement
            resultSpan.removeChild(resultSpan.lastChild!);
            resultSpan.insertAdjacentText('afterbegin', e.data.payload.toString())
        } else {
            let errorSpan = document.getElementById('neural-network-error') as HTMLSpanElement
            errorSpan.removeChild(errorSpan.lastChild!)
            errorSpan.insertAdjacentText('afterbegin', e.data.payload.toString())
        }
    }
}

init()
