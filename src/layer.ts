import { ILayer } from './Interfaces'
import { Neuron } from './neuron'

export class Layer implements ILayer {
    public defaultNeuronsCount: number = 0
    public offsetNeuronsCount: number = 0
    public get neuronsCount() {
        return this.defaultNeuronsCount + this.offsetNeuronsCount
    }

    public neurons: Neuron[] = []
}
