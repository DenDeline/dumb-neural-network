import { NeuralNetwork } from './neuralNetwork'
import { Greed } from './greed'

function initWithoutRender() {
    const dataset: number[][] = [
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
    ]

    const datasetOutput = [[1,0],[1,0],[1,0],[0,1],[0,1],[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[0,0]]

    const neuralNetwork = new NeuralNetwork(
        (inputLayer) => {
            inputLayer.countOfDefaultNeurons = 9
            inputLayer.countOfOffsetNeurons = 1
        },
        (hiddenLayer0) => {
            hiddenLayer0.countOfDefaultNeurons = 5
            hiddenLayer0.countOfOffsetNeurons = 1
        },
        (outputLayer) => {
            outputLayer.countOfDefaultNeurons = 2
            outputLayer.countOfOffsetNeurons = 0
        }
    )

    console.log('Weights: ', neuralNetwork.weights)
    console.log('Layers: ', neuralNetwork.layers)

    neuralNetwork.setInput(dataset[0])
    neuralNetwork.forWards()

    console.log('Layers: ', neuralNetwork.layers)

    // for(let i = 0; i < 16; i++) {
    //     neuralNetwork.training(dataset[i % 16], datasetOutput[i % 16])
    //
    //     console.log(`Gen ${Math.floor(i / 16)}, iteration : ${i}`, neuralNetwork.learningError)
    // }
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

initWithoutRender();
