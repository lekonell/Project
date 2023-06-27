const http = require("http");
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const spawn = require("child_process").spawn;

// const multer = require('multer');
// const uploader = multer({ dest: __dirname + '/predict_images/' });

const corsOptions = {
	origin: 'http://localhost',
	credentials: true
}

const app = express();
app.use(cors(corsOptions));
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const config = {
	SERVER_PORT: `2344`,
	CAPTION_PATH: `${__dirname}/datasets/images/captions.txt`,
	IMAGE_PATH: `${__dirname}/datasets/images/`,
	IMAGE_LIST: {},
	IMAGE_INDEX_LIST: [],

	image: null,
	predict: null,
};

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.post("/api/request", (req, res) => {
	let image_idx = Math.floor(Math.random() * Object.keys(config.IMAGE_LIST).length);

	config.image = config.IMAGE_INDEX_LIST[image_idx].image;
	config.predict = config.IMAGE_LIST[config.image].caption;

	res.send({
		'src': `${config.image}`,
	});
});

app.post("/api/predict", (req, res) => {
	const user_input = req.body.input;
	const predict_input = JSON.parse(JSON.stringify(config.predict));
	predict_input.push(user_input);
	predict_input.push(config.image);
	predict_input.push(0);

	var val_similarity = 0;
	const result = spawn('python3', ['predict.py', ...predict_input]);

	result.stdout.on('data', function (data) {
		var appData = data.toString();
		console.dir(appData);

		if (appData.indexOf('PREDICTED: ') != -1) {
			res.status(200);
			res.send({
				'similarity': `${appData.split(': ')[1] * 1}`,
			});
		}
	});

	result.stderr.on('data', function (data) {
		var appData = data.toString();
		console.dir(appData);
	});
});

app.listen(config.SERVER_PORT, () => {
	console.log(`server ready at port ${config.SERVER_PORT}`);

	let caption_data = fs.readFileSync(config.CAPTION_PATH, { encoding: 'utf8' });
	let caption_splitted = caption_data.split('\n');

	for (var i = 1; i < caption_splitted.length; i++) {
		if (caption_splitted[i].indexOf('.jpg,') == -1) continue;

		let image_name = caption_splitted[i].split('.jpg,')[0];
		image_name += `.jpg`;

		let image_caption = caption_splitted[i].split('.jpg,')[1];
		if (image_caption.indexOf(' .') != -1) {
			image_caption = image_caption.split(' .')[0];
		}

		if (!config.IMAGE_LIST[image_name]) {
			var imageData = {
				image: image_name,
				caption: [image_caption],
			};

			config.IMAGE_LIST[image_name] = imageData;
			config.IMAGE_INDEX_LIST[config.IMAGE_INDEX_LIST.length] = config.IMAGE_LIST[image_name];
		}
		else {
			config.IMAGE_LIST[image_name].caption.push(image_caption);
		}
	}
});