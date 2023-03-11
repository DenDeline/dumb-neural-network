import { ILayer } from './Interfaces'
import { Neuron } from './neuron'

export class Layer implements ILayer {
    public countOfDefaultNeurons: number = 0
    public countOfOffsetNeurons: number = 0
    public neurons: Neuron[] = []
}
