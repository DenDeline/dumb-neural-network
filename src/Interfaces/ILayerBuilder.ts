import { ILayer } from './ILayer'

export interface ILayerBuilder {
    (layerBuilder: ILayer): void;
}
