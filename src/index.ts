
let eraError = [];

class Neuron {
    public error: number = 0;
    public output: number;

    constructor(output: number) {
        this.output = output;
    }
}

interface ILayer {
    countOfDefaultNeurons: number, 
    countOfOffsetNeurons: number
}


class Layer implements ILayer {
    public countOfDefaultNeurons: number = 0;
    public countOfOffsetNeurons: number = 0;
    public neurons: Neuron[] = [];
}


interface ILayerBuilder {
    (layerBuilder: ILayer): void;
}

class LayerFactory {
    public static create(layerBuilder: ILayerBuilder): Layer {
        let layer = new Layer();
        layerBuilder(layer);
        this.initNeuronsForLayer(layer);
        return layer;
    }

    private static initNeuronsForLayer(layer: Layer){
        let neurons = layer.neurons;
        let countOfDefaultNeurons = layer.countOfDefaultNeurons;
        let countOfOffsetNeurons = layer.countOfOffsetNeurons;

        this.initDefaultNeuronsForLayer(neurons, countOfDefaultNeurons);
        this.initOffsetNeuronsForLayer(neurons, countOfOffsetNeurons);
    }

    private static initDefaultNeuronsForLayer(neurons: Neuron[],countOfDefaultNeurons: number){
        for (let i = 0; i < countOfDefaultNeurons; i++) {
            neurons.push(new Neuron(0));
        }
    }

    private static initOffsetNeuronsForLayer(neurons: Neuron[], countOfOffsetNeurons: number){
        for (let i = 0; i < countOfOffsetNeurons; i++ ){
            neurons.push(new Neuron(1));
        }
    }
}

class Weight {
    constructor(public value: number){  }
}

class WeightsFactory {
    public static create(fromLayer: Layer, toLayer: Layer, weightDefaultValue: number): Weight[][] {
        let weights: Weight[][] = [];
        this.initWeights(weights, fromLayer.countOfDefaultNeurons, fromLayer.countOfOffsetNeurons,toLayer.countOfDefaultNeurons, weightDefaultValue);
        return weights;
    }

    private static initWeights(weights: Weight[][], fromLayerDefaultNeuronsCount: number, fromLayerOffsetNeuronsCount: number, toLayerDefaultNeuronsCount: number, defaultWeightValue: number){
        this.initWeightsWidth(weights, fromLayerDefaultNeuronsCount, fromLayerOffsetNeuronsCount);
        this.initWeightsHeight(weights, toLayerDefaultNeuronsCount, defaultWeightValue);
    }

    private static initWeightsHeight(weights: Weight[][], toLayerNeurons: number, defaultWeight: number){
        for(let i = 0; i < weights.length; i++) {
            for (let j = 0; j < toLayerNeurons; j++ ){
                weights[i].push(new Weight(defaultWeight));
            }
        }
    }

    private static initWeightsWidth(weights: Weight[][], fromLayerDefaultNeuronsCount: number, fromLayerOffsetNeuronsCount: number){
        for (let i = 0; i < fromLayerDefaultNeuronsCount + fromLayerOffsetNeuronsCount; i++) {
            weights.push([]);
        }
    }
}

class NeuralNetwork {
    private layers: Layer[] = [];
    private weights: Weight[][][] = [];

    public learningError = 0;

    public readonly learningMulipier: number = 0.5;

    constructor(...layersBuilders: ILayerBuilder[]) {
        layersBuilders.forEach((layerBuilder) => {
            this.layers.push(LayerFactory.create(layerBuilder));
        });

        let layers = this.layers;
        for (let i = 1; i < layers.length; i++){
            this.weights.push(WeightsFactory.create(layers[i - 1], layers[i], 0.1));
        }
    }

    public get inputLayer(): Layer {
        return this.layers[0];
    }

    public get outputLayer() {
        return this.layers[this.layers.length - 1];
    }

    public setInput(input: Array<number>){
        let inputLayerNeurons = this.inputLayer.neurons;
        input.forEach((value, index) => inputLayerNeurons[index].output = value);
    }

    public resultFromOutput(){
        this.calculateLayersOutputs();
        let numbers = NeuronArrayToNumberArray(this.outputLayer.neurons);
        let result = numbers.indexOf(Math.max(...numbers));
        return result;
    }

    private calculateLayersOutputs() {
        let layers = this.layers;
        this.weights.forEach((weight, fromLayerIndex) => {
            this.forWards(layers[fromLayerIndex], weight, layers[fromLayerIndex + 1]);
        });
    }

    private forWards(inputLayer: Layer, weight: Weight[][], outputLayer: Layer){
        const inputLayerNeurons = inputLayer.neurons;
        const outputLayerNeurons = outputLayer.neurons;
        const weightWidth = weight.length;
        const weightHigh = weight[0].length;

        for (let i = 0; i < weightHigh; i++) {
            let result = 0;
            for(let j=0; j<weightWidth; j++){
                result += inputLayerNeurons[i].output * weight[j][i].value;
            }
            outputLayerNeurons[i].output = this.activationFunction(result);
        }
    }

    private activationFunction(input: number){
        return 1 / (1 + Math.pow(Math.E, -1 * input));
    }

    public balanceWeights(correctOutput: number[]) {
        this.resetLearningError();
        this.initOutputErrors(correctOutput);
        this.calculateOutputsErrors();
        this.recalculateWeights();
    }

    private resetLearningError(){
        this.learningError = 0;
    }

    private initOutputErrors(correctOutput: number[]){
        this.outputLayer.neurons.forEach((neuron, neuronIndex) => {
            neuron.error = correctOutput[neuronIndex] - neuron.output;
            this.learningError += Math.abs(neuron.error);
        });
    }

    private calculateOutputsErrors(){
        const layers = this.layers;
        const weights = this.weights;

        for  (let i = layers.length - 1; i > 1; i--) {
            this.findErrors(layers[i], weights[i-1], layers[i-1]);
        }
    }

    private findErrors(
        inputLayer: Layer,  
        weight: Weight[][], 
        outputLayer: Layer){

        const inputLayerNeurons = inputLayer.neurons;
        const outputLayerNeurons = outputLayer.neurons;

        const weightWidth = weight.length - outputLayer.countOfOffsetNeurons;
        const weightHigh = weight[0].length;

        for (let i = 0; i < weightWidth; i++) {
            let error = 0;
            for(let j = 0 ; j < weightHigh; j++){
                error +=  inputLayerNeurons[j].error * weight[i][j].value;
            }
            outputLayerNeurons[i].error = error;
        }
    }

    private recalculateWeights() {
        const layers = this.layers;
        this.weights.forEach((weight, weightIndex) => {
            this.backWards(layers[weightIndex], weight, layers[weightIndex + 1])
        })
    }

    private backWards(input: Layer,  weight: Weight[][], output: Layer){
        const inputLayerNeurons = input.neurons;
        const outputLayerNeurons = output.neurons;
        const weightWidth = weight.length;
        const weightHigh = weight[0].length;

        for (let j = 0; j < weightHigh; j++) {
            for(let i = 0; i < weightWidth; i++){
                weight[i][j].value += this.learningMulipier * outputLayerNeurons[j].error * this.activationFunctionDerivate(outputLayerNeurons[j].output) * inputLayerNeurons[i].output;
            }
        }
    }

    private activationFunctionDerivate(input: number) {
        return  input * (1 - input);
    }

    public training(dataset: number[], datasetOutput: number[]){
        this.setInput(dataset);
        this.calculateLayersOutputs();
        this.balanceWeights(datasetOutput);
    }
}

function NeuronArrayToNumberArray(neurons: Neuron[]) {
    return neurons.map((value) => value.output);
}

class HtmlClassList {
    private _classList: string[] = [];

    constructor(){}

    public add(htmlClass: string){
        if(this._classList.find((val) => val === htmlClass)){
            return;
        }
        this._classList.push(htmlClass);
    }

    public replace(oldClass: string, newClass: string) {
        let index = this._classList.findIndex((val) => val === oldClass);
        if(index !== -1) {
            this._classList[index] = newClass;
        }
    }

    public get rawClassList(){
        return this._classList;
    }
}

let neuralNetwork = new NeuralNetwork(
    (inputLayer) => {inputLayer.countOfDefaultNeurons = 9; inputLayer.countOfOffsetNeurons = 1},
    (hiddenLayer1) => { hiddenLayer1.countOfDefaultNeurons = 4, hiddenLayer1.countOfOffsetNeurons = 1},
    (hiddenLayer2) => {hiddenLayer2.countOfDefaultNeurons = 4, hiddenLayer2.countOfOffsetNeurons =  1 },
    (outputLayer) => { outputLayer.countOfDefaultNeurons = 2 }
);

interface IHtmlElement {
    render(): void;
}

abstract class BaseHtmlElement implements IHtmlElement {
    protected _htmlElement!: HTMLElement;
    protected _childElements: Array<IHtmlElement> = [];
    protected _htmlClassList: HtmlClassList = new HtmlClassList();

    public abstract render(): void;
    protected abstract initState(): void;
    public get rawHtml(){
        return this._htmlElement;
    }

    public appendChildHtml(childHtmlElement: HTMLElement){
        this._htmlElement.appendChild(childHtmlElement);
    }

    public appendChild(childElement: BaseHtmlElement) {
        this._childElements.push(childElement);
    }
}



class GreedCell extends BaseHtmlElement {
    private _solid: boolean = false;
    protected _htmlElement!: HTMLTableDataCellElement;

    constructor(){
        super();
        this.initState();
        this.render();
        this.handleGrag = this.handleGrag.bind(this);
    }

    private handleGrag(){
        this._solid = true;
        this._htmlClassList.replace("cell", "active-cell");
        this._htmlElement.classList.replace("cell", "active-cell");
    }

    public initState(){
        this._htmlClassList.add("cell");
    }

    public render(){
        let htmlElement = document.createElement('td');
        htmlElement.classList.add(...this._htmlClassList.rawClassList);
        htmlElement.addEventListener('dragenter', this.handleGrag);
        this._htmlElement = htmlElement;
    }

    public reset(){
        if(this._solid){
            this._solid = false;
            this._htmlClassList.replace("active-cell", "cell");
            this._htmlElement.classList.replace("active-cell", "cell");
        }
    }

    public toNumberArray() {
        return this._solid ? 1 : 0;
    }

    public inputDataset(dataset: number) {
        this.reset();
        if(dataset == 1){
            this._solid = true;
            this._htmlClassList.replace("cell", "active-cell");
            this._htmlElement.classList.replace("cell", "active-cell");
        }
    }
}

class GreedRow extends BaseHtmlElement {
    protected _htmlElement!: HTMLTableRowElement;
    protected _childElements: GreedCell[] = [];

    constructor(public width: number){
        super();
        this.initState();
        this.render();
    }

    protected initState(){
        for(let i = 0; i < this.width; i++) {
            let greedCell = new GreedCell();
            this.appendChild(greedCell);
        }
    }

    public render(){
        let htmlElement = document.createElement('tr');
        htmlElement.classList.add(...this._htmlClassList.rawClassList);
        this._htmlElement = htmlElement;

        for(let i = 0; i < this.width; i++) {
            let childElement = this._childElements[i];
            childElement.render();  
            this.appendChildHtml(childElement.rawHtml);
        }
    }

    public reset(){
        for(let i = 0; i < this.width; i++) {
            this._childElements[i].reset();
        }
    }

    public toNumberArray() {
        let output: number[] = [];
        for(let i = 0; i < this.width; i++) {
            output.push(this._childElements[i].toNumberArray());
        }
        return output;
    }

    public inputDataset(dataset: number[]) {
        for(let i = 0; i < this.width; i++) {
            this._childElements[i].inputDataset(dataset[i]);
        }
    }
}

class Greed extends BaseHtmlElement {
    protected _htmlElement!: HTMLTableElement;
    protected _childElements: GreedRow[] = [];    

    constructor(public width: number, public height: number){
        super();
        this.initState();
        this.render();
    }

    protected initState(){
        this._htmlClassList.add('greed');

        for (let i = 0; i < this.height; i++) {
            let greedRow = new GreedRow(this.width);
            this.appendChild(greedRow);
        }
    }
    
    public render(){
        let htmlElement  = document.createElement('table');
        htmlElement.classList.add(...this._htmlClassList.rawClassList);
        this._htmlElement = htmlElement;

        for(let i = 0; i < this.height; i++) {
            let childElement = this._childElements[i];
            childElement.render();  
            this.appendChildHtml(childElement.rawHtml);
        }
    }

    public toNumberArray() {
        let output: number[] = [];
        for(let i = 0; i< this.height; i++) {
            output = output.concat(this._childElements[i].toNumberArray());
        }
        return output;
    }

    public reset(){
        for (let i = 0; i < this.height; i++) {
            this._childElements[i].reset();
        }
    }

    public inputDataset(data: number[][]) {
        for(let i = 0; i < this.height; i++) {
            this._childElements[i].inputDataset(data[i]);
        }
    }
}

interface INeuralNetworkManager {

}

interface IGreedBuilder {
    width: number,
    height: number
}

class Dataset {
    public inputData: number[][] | undefined;
    public outputData: number[][] | undefined;

    public initDataset(inputData: number[][], outputData: number[][]){
        this.inputData = inputData;
        this.outputData = outputData;
    }
}

class NeuralNetworkManager {
    private _dataset: Dataset | undefined;
    private _neuralNwtwork: NeuralNetwork;
    private _greed: Greed;


    constructor(greedWidth: number, greedHeight: number){
        this._greed = new Greed(greedWidth, greedHeight);
        this._neuralNwtwork = new NeuralNetwork();
    }  
}

function init(){
    let dataset: number[][] = [
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
    ];

    let datasetOutput = [[1,0],[1,0],[1,0],[0,1],[0,1],[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[0,0]];

    let greed = new Greed(3, 3);
    greed.render();
    let wrapper = document.getElementsByClassName('wrapper-cell').item(0);
    wrapper?.appendChild(greed.rawHtml);

    let neuralNetwork = new NeuralNetwork(
        (inputLayer) => {inputLayer.countOfDefaultNeurons = 9, inputLayer.countOfOffsetNeurons = 1},
        (hiddenLayer0) => {hiddenLayer0.countOfDefaultNeurons = 4, hiddenLayer0.countOfOffsetNeurons = 1},
        (hiddenLayer1) => {hiddenLayer1.countOfDefaultNeurons = 4, hiddenLayer1.countOfOffsetNeurons = 1},
        (outputLayer) => {outputLayer.countOfDefaultNeurons = 2, outputLayer.countOfOffsetNeurons = 0}
    );

    let resetButton = document.getElementById('reset') as HTMLButtonElement;
    resetButton.addEventListener('click', () => greed.reset());

    let resultButton = document.getElementById('result-button') as HTMLButtonElement;
    resultButton.addEventListener('click', async () => {
        let resultSpan = document.getElementById('neural-network-result') as HTMLSpanElement;
        let output = greed.toNumberArray();
        neuralNetwork.setInput(output); 
        let neuralNetworkResult = neuralNetwork.resultFromOutput();
        resultSpan.removeChild(resultSpan.lastChild!);
        resultSpan.insertAdjacentText('afterbegin', neuralNetworkResult.toString());
    });

    let okButton  = document.getElementById('ok-button') as HTMLInputElement;
    
    okButton.addEventListener('click' , async () => {
        let actualAnswerHTML  = document.getElementById('actual-answer') as HTMLInputElement;
        let actualResult = +actualAnswerHTML.value;
        let genError = 0;

        //let output = greed.toNumberArray();
        dataset.forEach((data: number[], index:number) => {
            neuralNetwork.training(data, datasetOutput[index]);
            console.log(neuralNetwork.outputLayer.neurons.map(value => [value.output,value.error]));
            genError += neuralNetwork.learningError;
        });

        let errorSnap = document.getElementById('neural-network-error') as HTMLSpanElement;
        errorSnap.removeChild(errorSnap.lastChild!);
        errorSnap.insertAdjacentText('afterbegin', genError.toString());

        // neuralNetwork.setInput(dataset[0]);
        // neuralNetwork.resultFromOutput();

        // neuralNetwork.balanceWeights(datasetOutput[0]) ;


        // let stepSnap = document.getElementById('neural-network-step') as HTMLSpanElement;
        // stepSnap.removeChild(stepSnap.lastChild!);
        // stepSnap.insertAdjacentText('afterbegin', neuralNetwork);
    });

    let learningButton =  document.getElementById('learning-button') as HTMLInputElement;

    learningButton.addEventListener('click', async () => {  
        for(let i = 0; i < 16; i++) {
            neuralNetwork.training(dataset[i], datasetOutput[i]);
        }
    });
}

init();