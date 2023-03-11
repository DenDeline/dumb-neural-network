import { ILayerBuilder } from './Interfaces'
import { Layer } from './layer'
import { Neuron } from './neuron'

export class LayerFactory {
    public static create(layerBuilder: ILayerBuilder): Layer {
        let layer = new Layer()
        layerBuilder(layer)
        this.initNeuronsForLayer(layer)
        return layer
    }

    private static initNeuronsForLayer(layer: Layer) {
        let neurons = layer.neurons
        let countOfDefaultNeurons = layer.countOfDefaultNeurons
        let countOfOffsetNeurons = layer.countOfOffsetNeurons

        this.initDefaultNeuronsForLayer(neurons, countOfDefaultNeurons)
        this.initOffsetNeuronsForLayer(neurons, countOfOffsetNeurons)
    }

    private static initDefaultNeuronsForLayer(neurons: Neuron[], countOfDefaultNeurons: number) {
        for (let i = 0; i < countOfDefaultNeurons; i++) {
            neurons.push(new Neuron(0))
        }
    }

    private static initOffsetNeuronsForLayer(neurons: Neuron[], countOfOffsetNeurons: number) {
        for (let i = 0; i < countOfOffsetNeurons; i++) {
            neurons.push(new Neuron(1))
        }
    }
}
