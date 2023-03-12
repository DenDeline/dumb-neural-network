import { Layer } from './layer'
import { Weight } from './weight'

export class WeightsFactory {
    public static create(fromLayer: Layer, toLayer: Layer): Weight[][] {
        let weights: Weight[][] = []
        this.initWeights(weights, fromLayer.defaultNeuronsCount, fromLayer.offsetNeuronsCount, toLayer.defaultNeuronsCount)
        return weights
    }

    private static initWeights(weights: Weight[][], fromLayerDefaultNeuronsCount: number, fromLayerOffsetNeuronsCount: number, toLayerDefaultNeuronsCount: number) {
        this.initWeightsByNeuron(weights, fromLayerDefaultNeuronsCount, fromLayerOffsetNeuronsCount)
        this.bindWithNextLayer(weights, toLayerDefaultNeuronsCount)
    }

    private static bindWithNextLayer(weights: Weight[][], toLayerNeuronsCount: number) {
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < toLayerNeuronsCount; j++) {
                weights[i].push(new Weight(Math.random()))
            }
        }
    }

    private static initWeightsByNeuron(weights: Weight[][], fromLayerDefaultNeuronsCount: number, fromLayerOffsetNeuronsCount: number) {
        for (let i = 0; i < fromLayerDefaultNeuronsCount + fromLayerOffsetNeuronsCount; i++) {
            weights.push([])
        }
    }
}
