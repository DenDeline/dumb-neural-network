import { Layer } from './layer'
import { Weight } from './weight'
import { ILayerBuilder } from './Interfaces'
import { LayerFactory } from './layerFactory'
import { WeightsFactory } from './weightsFactory'
import { Neuron } from './neuron'

export class NeuralNetwork {
    public readonly layers: Layer[] = []
    public weights: Weight[][][] = []
    public learningError = 0
    public readonly learningMultiplier: number = 0.5

    constructor(...layersBuilders: ILayerBuilder[]) {
        this.layers = layersBuilders.map((layerBuilder) => LayerFactory.create(layerBuilder))
        let layers = this.layers
        for (let i = 1; i < layers.length; i++) {
            this.weights.push(WeightsFactory.create(layers[i - 1], layers[i]))
        }
    }

    public get inputLayer(): Layer {
        return this.layers[0]
    }

    public get outputLayer() {
        return this.layers[this.layers.length - 1]
    }

    public setInput(input: Array<number>) {
        let inputLayerNeurons = this.inputLayer.neurons
        input.forEach((value, index) => inputLayerNeurons[index].output = value)
    }

    public resultFromOutput() {
        this.forwardPropagate()
        let numbers = this.neuronArrayToNumberArray(this.outputLayer.neurons)
        let result = numbers.indexOf(Math.max(...numbers))
        return result
    }

    public forwardPropagate() {
        let layers = this.layers

        this.weights.forEach((weightByLayer, currentLayerIndex) => {
            const currentLayerNeurons = layers[currentLayerIndex].neurons
            const nextLayerNeurons = layers[currentLayerIndex + 1].neurons

            const currentLayerAllNeuronCount = weightByLayer.length
            const nextLayerDefaultNeuronCount = weightByLayer[0].length

            for (let nextLayerNeuronIndex = 0; nextLayerNeuronIndex < nextLayerDefaultNeuronCount; nextLayerNeuronIndex++) {
                let result = 0
                for (let currentLayerNeuronIndex = 0; currentLayerNeuronIndex < currentLayerAllNeuronCount; currentLayerNeuronIndex++) {
                    result
                        += currentLayerNeurons[currentLayerNeuronIndex].output
                        * weightByLayer[currentLayerNeuronIndex][nextLayerNeuronIndex].value
                }
                nextLayerNeurons[nextLayerNeuronIndex].output = this.activationFunction(result)
            }
        })
    }

    private activationFunction(input: number) {
        return 1 / (1 + Math.pow(Math.E, -1 * input))
    }

    private activationFunctionDerivative(input: number) {
        return input * (1 - input)
    }

    public balanceWeights(correctOutput: number[]) {
        this.initOutputErrors(correctOutput)
        this.backwardPropagateError()
        this.updateWeights()
    }

    private initOutputErrors(correctOutput: number[]) {
        let learningError = 0
        this.outputLayer.neurons.forEach((neuron, neuronIndex) => {
            neuron.error = correctOutput[neuronIndex] - neuron.output
            learningError += Math.abs(neuron.error)
        })
        this.learningError = learningError
    }

    private backwardPropagateError() {
        const layers = this.layers
        const weights = this.weights

        for (let currentLayerIndex = layers.length - 1; currentLayerIndex > 1; currentLayerIndex--) {
            const currentLayerInfo = layers[currentLayerIndex]
            const prevLayerInfo = layers[currentLayerIndex - 1]

            const prevLayerWeights = weights[currentLayerIndex - 1]

            const currentLayerNeurons = currentLayerInfo.neurons
            const prevLayerNeurons = prevLayerInfo.neurons

            for (let prevLayerNeuronIndex = 0; prevLayerNeuronIndex < prevLayerInfo.countOfDefaultNeurons; prevLayerNeuronIndex++) {
                let error = 0
                for (let currentLayerNeuronIndex = 0; currentLayerNeuronIndex < currentLayerInfo.countOfDefaultNeurons; currentLayerNeuronIndex++) {
                    error
                        += currentLayerNeurons[currentLayerNeuronIndex].error
                        * prevLayerWeights[prevLayerNeuronIndex][currentLayerNeuronIndex].value
                }
                prevLayerNeurons[prevLayerNeuronIndex].error = error
            }
        }
    }

    private updateWeights() {
        const layers = this.layers
        this.weights.forEach((weightByLayer, currentLayerIndex) => {
            const currentLayerNeurons = layers[currentLayerIndex].neurons
            const nextLayerNeurons = layers[currentLayerIndex + 1].neurons

            const currentLayerAllNeuronsCount = weightByLayer.length
            const nextLayerDefaultNeuronsCount = weightByLayer[0].length

            for (let nextLayerNeuronIndex = 0; nextLayerNeuronIndex < nextLayerDefaultNeuronsCount; nextLayerNeuronIndex++) {
                for (let currentLayerNeuronIndex = 0; currentLayerNeuronIndex < currentLayerAllNeuronsCount; currentLayerNeuronIndex++) {
                    weightByLayer[currentLayerNeuronIndex][nextLayerNeuronIndex].value
                        += this.learningMultiplier * nextLayerNeurons[nextLayerNeuronIndex].error
                        * this.activationFunctionDerivative(nextLayerNeurons[nextLayerNeuronIndex].output)
                        * currentLayerNeurons[currentLayerNeuronIndex].output
                }
            }
        })
    }

    public training(dataset: number[][], datasetOutput: number[][], maxEpochCount: number) {
        for (let i = 0; i < maxEpochCount; i++) {
            for (let j = 0; j < dataset.length; j++) {
                this.setInput(dataset[j])
                this.forwardPropagate()
                this.balanceWeights(datasetOutput[j])
            }
        }
    }

    private neuronArrayToNumberArray(neurons: Neuron[]) {
        return neurons.map((value) => value.output)
    }

    public predict() {
        this.forwardPropagate()
        return this.neuronArrayToNumberArray(this.outputLayer.neurons)
    }
}
