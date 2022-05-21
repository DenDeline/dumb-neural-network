"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let eraError = [];
class Neuron {
    constructor(output) {
        this.error = 0;
        this.output = output;
    }
}
class Layer {
    constructor() {
        this.countOfDefaultNeurons = 0;
        this.countOfOffsetNeurons = 0;
        this.neurons = [];
    }
}
class LayerFactory {
    static create(layerBuilder) {
        let layer = new Layer();
        layerBuilder(layer);
        this.initNeuronsForLayer(layer);
        return layer;
    }
    static initNeuronsForLayer(layer) {
        let neurons = layer.neurons;
        let countOfDefaultNeurons = layer.countOfDefaultNeurons;
        let countOfOffsetNeurons = layer.countOfOffsetNeurons;
        this.initDefaultNeuronsForLayer(neurons, countOfDefaultNeurons);
        this.initOffsetNeuronsForLayer(neurons, countOfOffsetNeurons);
    }
    static initDefaultNeuronsForLayer(neurons, countOfDefaultNeurons) {
        for (let i = 0; i < countOfDefaultNeurons; i++) {
            neurons.push(new Neuron(0));
        }
    }
    static initOffsetNeuronsForLayer(neurons, countOfOffsetNeurons) {
        for (let i = 0; i < countOfOffsetNeurons; i++) {
            neurons.push(new Neuron(1));
        }
    }
}
class Weight {
    constructor(value) {
        this.value = value;
    }
}
class WeightsFactory {
    static create(fromLayer, toLayer, weightDefaultValue) {
        let weights = [];
        this.initWeights(weights, fromLayer.countOfDefaultNeurons, fromLayer.countOfOffsetNeurons, toLayer.countOfDefaultNeurons, weightDefaultValue);
        return weights;
    }
    static initWeights(weights, fromLayerDefaultNeuronsCount, fromLayerOffsetNeuronsCount, toLayerDefaultNeuronsCount, defaultWeightValue) {
        this.initWeightsWidth(weights, fromLayerDefaultNeuronsCount, fromLayerOffsetNeuronsCount);
        this.initWeightsHeight(weights, toLayerDefaultNeuronsCount, defaultWeightValue);
    }
    static initWeightsHeight(weights, toLayerNeurons, defaultWeight) {
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < toLayerNeurons; j++) {
                weights[i].push(new Weight(defaultWeight));
            }
        }
    }
    static initWeightsWidth(weights, fromLayerDefaultNeuronsCount, fromLayerOffsetNeuronsCount) {
        for (let i = 0; i < fromLayerDefaultNeuronsCount + fromLayerOffsetNeuronsCount; i++) {
            weights.push([]);
        }
    }
}
class NeuralNetwork {
    constructor(...layersBuilders) {
        this.layers = [];
        this.weights = [];
        this.learningError = 0;
        this.learningMulipier = 0.5;
        layersBuilders.forEach((layerBuilder) => {
            this.layers.push(LayerFactory.create(layerBuilder));
        });
        let layers = this.layers;
        for (let i = 1; i < layers.length; i++) {
            this.weights.push(WeightsFactory.create(layers[i - 1], layers[i], 0.1));
        }
    }
    get inputLayer() {
        return this.layers[0];
    }
    get outputLayer() {
        return this.layers[this.layers.length - 1];
    }
    setInput(input) {
        let inputLayerNeurons = this.inputLayer.neurons;
        input.forEach((value, index) => inputLayerNeurons[index].output = value);
    }
    resultFromOutput() {
        this.calculateLayersOutputs();
        let numbers = NeuronArrayToNumberArray(this.outputLayer.neurons);
        let result = numbers.indexOf(Math.max(...numbers));
        return result;
    }
    calculateLayersOutputs() {
        let layers = this.layers;
        this.weights.forEach((weight, fromLayerIndex) => {
            this.forWards(layers[fromLayerIndex], weight, layers[fromLayerIndex + 1]);
        });
    }
    forWards(inputLayer, weight, outputLayer) {
        const inputLayerNeurons = inputLayer.neurons;
        const outputLayerNeurons = outputLayer.neurons;
        const weightWidth = weight.length;
        const weightHigh = weight[0].length;
        for (let i = 0; i < weightHigh; i++) {
            let result = 0;
            for (let j = 0; j < weightWidth; j++) {
                result += inputLayerNeurons[i].output * weight[j][i].value;
            }
            outputLayerNeurons[i].output = this.activationFunction(result);
        }
    }
    activationFunction(input) {
        return 1 / (1 + Math.pow(Math.E, -1 * input));
    }
    balanceWeights(correctOutput) {
        this.resetLearningError();
        this.initOutputErrors(correctOutput);
        this.calculateOutputsErrors();
        this.recalculateWeights();
    }
    resetLearningError() {
        this.learningError = 0;
    }
    initOutputErrors(correctOutput) {
        this.outputLayer.neurons.forEach((neuron, neuronIndex) => {
            neuron.error = correctOutput[neuronIndex] - neuron.output;
            this.learningError += Math.abs(neuron.error);
        });
    }
    calculateOutputsErrors() {
        const layers = this.layers;
        const weights = this.weights;
        for (let i = layers.length - 1; i > 1; i--) {
            this.findErrors(layers[i], weights[i - 1], layers[i - 1]);
        }
    }
    findErrors(inputLayer, weight, outputLayer) {
        const inputLayerNeurons = inputLayer.neurons;
        const outputLayerNeurons = outputLayer.neurons;
        const weightWidth = weight.length - outputLayer.countOfOffsetNeurons;
        const weightHigh = weight[0].length;
        for (let i = 0; i < weightWidth; i++) {
            let error = 0;
            for (let j = 0; j < weightHigh; j++) {
                error += inputLayerNeurons[j].error * weight[i][j].value;
            }
            outputLayerNeurons[i].error = error;
        }
    }
    recalculateWeights() {
        const layers = this.layers;
        this.weights.forEach((weight, weightIndex) => {
            this.backWards(layers[weightIndex], weight, layers[weightIndex + 1]);
        });
    }
    backWards(input, weight, output) {
        const inputLayerNeurons = input.neurons;
        const outputLayerNeurons = output.neurons;
        const weightWidth = weight.length;
        const weightHigh = weight[0].length;
        for (let j = 0; j < weightHigh; j++) {
            for (let i = 0; i < weightWidth; i++) {
                weight[i][j].value += this.learningMulipier * outputLayerNeurons[j].error * this.activationFunctionDerivate(outputLayerNeurons[j].output) * inputLayerNeurons[i].output;
            }
        }
    }
    activationFunctionDerivate(input) {
        return input * (1 - input);
    }
    training(dataset, datasetOutput) {
        this.setInput(dataset);
        this.calculateLayersOutputs();
        this.balanceWeights(datasetOutput);
    }
}
function NeuronArrayToNumberArray(neurons) {
    return neurons.map((value) => value.output);
}
class HtmlClassList {
    constructor() {
        this._classList = [];
    }
    add(htmlClass) {
        if (this._classList.find((val) => val === htmlClass)) {
            return;
        }
        this._classList.push(htmlClass);
    }
    replace(oldClass, newClass) {
        let index = this._classList.findIndex((val) => val === oldClass);
        if (index !== -1) {
            this._classList[index] = newClass;
        }
    }
    get rawClassList() {
        return this._classList;
    }
}
let neuralNetwork = new NeuralNetwork((inputLayer) => { inputLayer.countOfDefaultNeurons = 9; inputLayer.countOfOffsetNeurons = 1; }, (hiddenLayer1) => { hiddenLayer1.countOfDefaultNeurons = 4, hiddenLayer1.countOfOffsetNeurons = 1; }, (hiddenLayer2) => { hiddenLayer2.countOfDefaultNeurons = 4, hiddenLayer2.countOfOffsetNeurons = 1; }, (outputLayer) => { outputLayer.countOfDefaultNeurons = 2; });
class BaseHtmlElement {
    constructor() {
        this._childElements = [];
        this._htmlClassList = new HtmlClassList();
    }
    get rawHtml() {
        return this._htmlElement;
    }
    appendChildHtml(childHtmlElement) {
        this._htmlElement.appendChild(childHtmlElement);
    }
    appendChild(childElement) {
        this._childElements.push(childElement);
    }
}
class GreedCell extends BaseHtmlElement {
    constructor() {
        super();
        this._solid = false;
        this.initState();
        this.render();
        this.handleGrag = this.handleGrag.bind(this);
    }
    handleGrag() {
        this._solid = true;
        this._htmlClassList.replace("cell", "active-cell");
        this._htmlElement.classList.replace("cell", "active-cell");
    }
    initState() {
        this._htmlClassList.add("cell");
    }
    render() {
        let htmlElement = document.createElement('td');
        htmlElement.classList.add(...this._htmlClassList.rawClassList);
        htmlElement.addEventListener('dragenter', this.handleGrag);
        this._htmlElement = htmlElement;
    }
    reset() {
        if (this._solid) {
            this._solid = false;
            this._htmlClassList.replace("active-cell", "cell");
            this._htmlElement.classList.replace("active-cell", "cell");
        }
    }
    toNumberArray() {
        return this._solid ? 1 : 0;
    }
    inputDataset(dataset) {
        this.reset();
        if (dataset == 1) {
            this._solid = true;
            this._htmlClassList.replace("cell", "active-cell");
            this._htmlElement.classList.replace("cell", "active-cell");
        }
    }
}
class GreedRow extends BaseHtmlElement {
    constructor(width) {
        super();
        this.width = width;
        this._childElements = [];
        this.initState();
        this.render();
    }
    initState() {
        for (let i = 0; i < this.width; i++) {
            let greedCell = new GreedCell();
            this.appendChild(greedCell);
        }
    }
    render() {
        let htmlElement = document.createElement('tr');
        htmlElement.classList.add(...this._htmlClassList.rawClassList);
        this._htmlElement = htmlElement;
        for (let i = 0; i < this.width; i++) {
            let childElement = this._childElements[i];
            childElement.render();
            this.appendChildHtml(childElement.rawHtml);
        }
    }
    reset() {
        for (let i = 0; i < this.width; i++) {
            this._childElements[i].reset();
        }
    }
    toNumberArray() {
        let output = [];
        for (let i = 0; i < this.width; i++) {
            output.push(this._childElements[i].toNumberArray());
        }
        return output;
    }
    inputDataset(dataset) {
        for (let i = 0; i < this.width; i++) {
            this._childElements[i].inputDataset(dataset[i]);
        }
    }
}
class Greed extends BaseHtmlElement {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
        this._childElements = [];
        this.initState();
        this.render();
    }
    initState() {
        this._htmlClassList.add('greed');
        for (let i = 0; i < this.height; i++) {
            let greedRow = new GreedRow(this.width);
            this.appendChild(greedRow);
        }
    }
    render() {
        let htmlElement = document.createElement('table');
        htmlElement.classList.add(...this._htmlClassList.rawClassList);
        this._htmlElement = htmlElement;
        for (let i = 0; i < this.height; i++) {
            let childElement = this._childElements[i];
            childElement.render();
            this.appendChildHtml(childElement.rawHtml);
        }
    }
    toNumberArray() {
        let output = [];
        for (let i = 0; i < this.height; i++) {
            output = output.concat(this._childElements[i].toNumberArray());
        }
        return output;
    }
    reset() {
        for (let i = 0; i < this.height; i++) {
            this._childElements[i].reset();
        }
    }
    inputDataset(data) {
        for (let i = 0; i < this.height; i++) {
            this._childElements[i].inputDataset(data[i]);
        }
    }
}
class Dataset {
    initDataset(inputData, outputData) {
        this.inputData = inputData;
        this.outputData = outputData;
    }
}
class NeuralNetworkManager {
    constructor(greedWidth, greedHeight) {
        this._greed = new Greed(greedWidth, greedHeight);
        this._neuralNwtwork = new NeuralNetwork();
    }
}
function init() {
    let dataset = [
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 1, 0, 0],
        [1, 1, 1, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 1, 1, 1],
        [0, 1, 0, 0, 1, 0, 1, 1, 1],
        [0, 0, 1, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    let datasetOutput = [[1, 0], [1, 0], [1, 0], [0, 1], [0, 1], [0, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [0, 0]];
    let greed = new Greed(3, 3);
    greed.render();
    let wrapper = document.getElementsByClassName('wrapper-cell').item(0);
    wrapper === null || wrapper === void 0 ? void 0 : wrapper.appendChild(greed.rawHtml);
    let neuralNetwork = new NeuralNetwork((inputLayer) => { inputLayer.countOfDefaultNeurons = 9, inputLayer.countOfOffsetNeurons = 1; }, (hiddenLayer0) => { hiddenLayer0.countOfDefaultNeurons = 4, hiddenLayer0.countOfOffsetNeurons = 1; }, (hiddenLayer1) => { hiddenLayer1.countOfDefaultNeurons = 4, hiddenLayer1.countOfOffsetNeurons = 1; }, (outputLayer) => { outputLayer.countOfDefaultNeurons = 2, outputLayer.countOfOffsetNeurons = 0; });
    let resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', () => greed.reset());
    let resultButton = document.getElementById('result-button');
    resultButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        let resultSpan = document.getElementById('neural-network-result');
        let output = greed.toNumberArray();
        neuralNetwork.setInput(output);
        let neuralNetworkResult = neuralNetwork.resultFromOutput();
        resultSpan.removeChild(resultSpan.lastChild);
        resultSpan.insertAdjacentText('afterbegin', neuralNetworkResult.toString());
    }));
    let okButton = document.getElementById('ok-button');
    okButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        let actualAnswerHTML = document.getElementById('actual-answer');
        let actualResult = +actualAnswerHTML.value;
        let genError = 0;
        //let output = greed.toNumberArray();
        dataset.forEach((data, index) => {
            neuralNetwork.training(data, datasetOutput[index]);
            console.log(neuralNetwork.outputLayer.neurons.map(value => [value.output, value.error]));
            genError += neuralNetwork.learningError;
        });
        let errorSnap = document.getElementById('neural-network-error');
        errorSnap.removeChild(errorSnap.lastChild);
        errorSnap.insertAdjacentText('afterbegin', genError.toString());
        // neuralNetwork.setInput(dataset[0]);
        // neuralNetwork.resultFromOutput();
        // neuralNetwork.balanceWeights(datasetOutput[0]) ;
        // let stepSnap = document.getElementById('neural-network-step') as HTMLSpanElement;
        // stepSnap.removeChild(stepSnap.lastChild!);
        // stepSnap.insertAdjacentText('afterbegin', neuralNetwork);
    }));
    let learningButton = document.getElementById('learning-button');
    learningButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 16; i++) {
            neuralNetwork.training(dataset[i], datasetOutput[i]);
        }
    }));
}
init();
