import { NeuralNetwork } from './neuralNetwork'
import { IMessage } from './Interfaces'

const dataset: number[][] = [
    [1,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,1,1,1],
    [1,0,0,1,0,0,1,0,0],
    [0,1,0,0,1,0,0,1,0],
    [0,0,1,0,0,1,0,0,1],
    [1,1,1,1,0,0,1,0,0],
    [1,1,1,0,1,0,0,1,0],
    [1,1,1,0,0,1,0,0,1],
    [1,0,0,1,1,1,1,0,0],
    [0,1,0,1,1,1,0,1,0],
    [0,0,1,1,1,1,0,0,1],
    [1,0,0,1,0,0,1,1,1],
    [0,1,0,0,1,0,1,1,1],
    [0,0,1,0,0,1,1,1,1],
    [0,0,0,0,0,0,0,0,0]
]

const datasetOutput = [[1,0],[1,0],[1,0],[0,1],[0,1],[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[0,0]]

const neuralNetwork = new NeuralNetwork(
    (inputLayer) => {
        inputLayer.countOfDefaultNeurons = 9
        inputLayer.countOfOffsetNeurons = 1
    },
    (hiddenLayer0) => {
        hiddenLayer0.countOfDefaultNeurons = 5
        hiddenLayer0.countOfOffsetNeurons = 1
    },
    (outputLayer) => {
        outputLayer.countOfDefaultNeurons = 2
        outputLayer.countOfOffsetNeurons = 0
    }
)

self.onmessage = (e: MessageEvent<IMessage>) => {
    // const metric = () => {
    //     let countOfValid = 0
    //
    //     for (let i = 0; i < dataset.length; i++) {
    //         neuralNetwork.setInput(dataset[i])
    //         if (!neuralNetwork.predict().some((v, j) => Math.round(v) != datasetOutput[i][j])){
    //             ++countOfValid
    //         }
    //     }
    //
    //     console.log(countOfValid / dataset.length)
    // }
    //
    // metric()

    if (e.data.action === 'training') {
        neuralNetwork.training(dataset, datasetOutput, 500)
        self.postMessage({ action: 'training_result', payload: neuralNetwork.learningError })

    } else {
        neuralNetwork.setInput(e.data.payload as Array<number>)
        neuralNetwork.predict()

        self.postMessage({ action: 'prediction_result', payload: neuralNetwork.predict().map((v) => Math.round(v)) })
    }
}

export {}
