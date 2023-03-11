import { Layer } from './layer'
import { Weight } from './weight'

export class WeightsFactory {
    public static create(fromLayer: Layer, toLayer: Layer): Weight[][] {
        let weights: Weight[][] = []
        this.initWeights(weights, fromLayer.countOfDefaultNeurons, fromLayer.countOfOffsetNeurons, toLayer.countOfDefaultNeurons)
        return weights
    }

    private static initWeights(weights: Weight[][], fromLayerDefaultNeuronsCount: number, fromLayerOffsetNeuronsCount: number, toLayerDefaultNeuronsCount: number) {
        this.initWeightsWidth(weights, fromLayerDefaultNeuronsCount, fromLayerOffsetNeuronsCount)
        this.initWeightsHeight(weights, toLayerDefaultNeuronsCount)
    }

    private static initWeightsHeight(weights: Weight[][], toLayerNeurons: number) {
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < toLayerNeurons; j++) {
                weights[i].push(new Weight(Math.random()))
            }
        }
    }

    private static initWeightsWidth(weights: Weight[][], fromLayerDefaultNeuronsCount: number, fromLayerOffsetNeuronsCount: number) {
        for (let i = 0; i < fromLayerDefaultNeuronsCount + fromLayerOffsetNeuronsCount; i++) {
            weights.push([])
        }
    }
}
