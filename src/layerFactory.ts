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
        this.initDefaultNeuronsForLayer(layer.neurons, layer.defaultNeuronsCount)
        this.initOffsetNeuronsForLayer(layer.neurons, layer.offsetNeuronsCount)
    }

    private static initDefaultNeuronsForLayer(neurons: Neuron[], defaultNeuronsCount: number) {
        for (let i = 0; i < defaultNeuronsCount; i++) {
            neurons.push(new Neuron(0))
        }
    }

    private static initOffsetNeuronsForLayer(neurons: Neuron[], offsetNeuronsCount: number) {
        for (let i = 0; i < offsetNeuronsCount; i++) {
            neurons.push(new Neuron(1))
        }
    }
}
