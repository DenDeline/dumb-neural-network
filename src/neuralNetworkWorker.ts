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
        inputLayer.defaultNeuronsCount = 9
        inputLayer.offsetNeuronsCount = 1
    },
    (hiddenLayer0) => {
        hiddenLayer0.defaultNeuronsCount = 5
        hiddenLayer0.offsetNeuronsCount = 1
    },
    (outputLayer) => {
        outputLayer.defaultNeuronsCount = 2
        outputLayer.offsetNeuronsCount = 0
    }
)

self.onmessage = (e: MessageEvent<IMessage>) => {
    if (e.data.action === 'training') {
        neuralNetwork.training(dataset, datasetOutput, 500, 0.1)
        self.postMessage({ action: 'training_result', payload: { learningError: neuralNetwork.learningError, epoch: neuralNetwork.learningEpoch } })

    } else {
        neuralNetwork.setInput(e.data.payload as Array<number>)
        const prediction = neuralNetwork.predict()
        self.postMessage({ action: 'prediction_result', payload: prediction.map((v) => Math.round(v)) })
    }
}

export {}
