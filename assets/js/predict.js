console.log('Hello TensorFlow');

console.log(tf);

let shape_x = shape_y = 64;
let xtimesy = shape_x * shape_y;

$("#image-selector").change(function () {
    let reader = new FileReader();
    reader.onload = function () {
        let dataURL = reader.result;
        $("#selected-image").attr("src", dataURL);
        $("#prediction-list").empty();
    }
    let file = $("#image-selector").prop("files")[0];
    reader.readAsDataURL(file);
});

$("#select-model").change(function(){
    loadModel($("#select-model").val());
});

let model;
async function loadModel(name) {
    $(".progress-bar").show();
    model=undefined;
    model = await tf.loadLayersModel(`http://localhost:3000/assets/tf_models/${name}/model.json`);
    model.summary();
    $(".progress-bar").hide();
}

$("#predict-button").click(async function(){
    let image = $("#selected-image").get(0);
    let tensor = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([shape_x, shape_y])
        .toFloat()
        .expandDims();

    // More pre-processing to be added here later
    //mean RGB across imagenet dataset
    let meanImageNetRGB = {
        red: 123.68,
        green: 116.779,
        blue: 103.939
    };

    let indices = [
        tf.tensor1d([0], "int32"),
        tf.tensor1d([0], "int32"),
        tf.tensor1d([0], "int32")
    ];

    let centeredRGB = {
        red: tf.gather(tensor, indices[0], 2)
            .sub(tf.scalar(meanImageNetRGB.red))
            .reshape([xtimesy]),
        green: tf.gather(tensor, indices[1], 2)
        .sub(tf.scalar(meanImageNetRGB.green))
        .reshape([xtimesy]),
        blue: tf.gather(tensor, indices[2], 2)
        .sub(tf.scalar(meanImageNetRGB.blue))
        .reshape([xtimesy])
    };

    let processedTensor = tf.stack([centeredRGB.red, centeredRGB.green, centeredRGB.blue], 1)
        .reshape([shape_x,shape_y,3])
        .reverse(2)
        .expandDims();

    let predictions = await model.predict(processedTensor).data();

    let top1 = Array.from(predictions)
        .map(function(p,i){
            return{
                probability:p,
                className: IMAGENET_CLASSES[i]
            };
        }).sort(function(a, b){
            return b.probability - a.probability
        }).slice(0,1)

    $("#prediction-list").empty();

    top1.forEach(function(p){
        //console.log(p.className);
        $("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(2)}</li>`);
    });
});