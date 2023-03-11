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
        this.forWards()
        let numbers = this.neuronArrayToNumberArray(this.outputLayer.neurons)
        let result = numbers.indexOf(Math.max(...numbers))
        return result
    }

    public forWards() {
        let layers = this.layers

        this.weights.forEach((weight, currentLayerIndex) => {
            const currentLayerNeurons = layers[currentLayerIndex].neurons
            const nextLayerNeurons = layers[currentLayerIndex + 1].neurons
            const currentLayerNeuronCount = weight.length
            const nextLayerNeuronCount = weight[0].length

            for (let i = 0; i < nextLayerNeuronCount; i++) {
                let result = 0
                for (let j = 0; j < currentLayerNeuronCount; j++) {
                    result += currentLayerNeurons[i].output * weight[j][i].value
                }
                nextLayerNeurons[i].output = this.activationFunction(result)
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
        this.resetLearningError()
        this.initOutputErrors(correctOutput)
        this.calculateOutputsErrors()
        this.recalculateWeights()
    }

    private resetLearningError() {
        this.learningError = 0
    }

    private initOutputErrors(correctOutput: number[]) {
        this.outputLayer.neurons.forEach((neuron, neuronIndex) => {
            neuron.error = correctOutput[neuronIndex] - neuron.output
            this.learningError += Math.abs(neuron.error)
        })
    }

    private calculateOutputsErrors() {
        const layers = this.layers
        const weights = this.weights

        for (let i = layers.length - 1; i > 1; i--) {
            this.findErrors(layers[i], weights[i - 1], layers[i - 1])
        }
    }

    private findErrors(
        inputLayer: Layer,
        weight: Weight[][],
        outputLayer: Layer) {

        const inputLayerNeurons = inputLayer.neurons
        const outputLayerNeurons = outputLayer.neurons

        const weightWidth = weight.length - outputLayer.countOfOffsetNeurons
        const weightHigh = weight[0].length

        for (let i = 0; i < weightWidth; i++) {
            let error = 0
            for (let j = 0; j < weightHigh; j++) {
                error += inputLayerNeurons[j].error * weight[i][j].value
            }
            outputLayerNeurons[i].error = error
        }
    }

    private recalculateWeights() {
        const layers = this.layers
        this.weights.forEach((weight, weightIndex) => {
            this.backWards(layers[weightIndex], weight, layers[weightIndex + 1])
        })
    }

    private backWards(input: Layer, weight: Weight[][], output: Layer) {
        const inputLayerNeurons = input.neurons
        const outputLayerNeurons = output.neurons
        const weightWidth = weight.length
        const weightHigh = weight[0].length

        for (let j = 0; j < weightHigh; j++) {
            for (let i = 0; i < weightWidth; i++) {
                weight[i][j].value += this.learningMultiplier * outputLayerNeurons[j].error * this.activationFunctionDerivative(outputLayerNeurons[j].output) * inputLayerNeurons[i].output
            }
        }
    }

    public training(dataset: number[], datasetOutput: number[]) {
        this.setInput(dataset)
        this.forWards()
        this.balanceWeights(datasetOutput)
    }

    private neuronArrayToNumberArray(neurons: Neuron[]) {
        return neurons.map((value) => value.output)
    }
}
