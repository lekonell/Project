import os
import sys
import torch

from transformers import AutoTokenizer, ViTFeatureExtractor, VisionEncoderDecoderModel
from sentence_transformers import SentenceTransformer, util
from PIL import Image

def memoize(func):
	cache = {}

	def memoizer(*args, **kwargs):
		key = str(args) + str(kwargs)
		if key not in cache:
			cache[key] = func(*args, **kwargs)
		
		return cache[key]

	return memoizer

def open_image(path):
	image = Image.open(path)
	if image.mode != "RGB":
		image = image.convert(mode="RGB")

	return image

class ImageCaptioning():
	def __init__(self):
		checkpoint = 'nlpconnect/vit-gpt2-image-captioning'
		self.device='cpu'

		self.feature_extractor = ViTFeatureExtractor.from_pretrained(checkpoint)
		self.tokenizer = AutoTokenizer.from_pretrained(checkpoint)
		self.model = VisionEncoderDecoderModel.from_pretrained(checkpoint).to(self.device)

	def predict(self, image, max_length=64, num_beams=4):
		image = self.feature_extractor(image, return_tensors="pt").pixel_values.to(self.device)
		clean_text = lambda x: x.replace('<|endoftext|>','').split('\n')[0]
		caption_ids = self.model.generate(image, max_length = max_length)[0]
		caption_text = clean_text(self.tokenizer.decode(caption_ids))

		return caption_text

class STS():
	def __init__(self):
		# jhgan/ko-sroberta-multitask
		self.embedder = SentenceTransformer('paraphrase-MiniLM-L6-v2', cache_folder='cache')

	@memoize
	def get_embedding(self, text):
		return self.embedder.encode(text)

	def get_cos_sim_from_text(self, text1, text2):
		text1_embeddings = self.get_embedding(text1)
		text2_embeddings = self.get_embedding(text2)

		cos_score = util.pytorch_cos_sim(text1_embeddings, text2_embeddings)
		cos_score.cpu()

		return cos_score[0].item()

cap = ImageCaptioning()
sts = STS()

def predict_with_captioning(image_path, text):
	image = open_image(image_path)
	text2 = cap.predict(image)
	print(f'image captioning result: {text2}')

	return sts.get_cos_sim_from_text(text, text2)

def predict(answer, text):
	return sts.get_cos_sim_from_text(answer, text)

'''
	sys.argv[0]: this file name (predict.py)

	sys.argv[1]
	- - - - - -
	sys.argv[5]: answer caption

	sys.argv[6]: user input caption
	sys.argv[7]: image file name
	sys.argv[8]: user upload image flag (0: no, 1: yes)
'''

if sys.argv[8] == '0':
	image_file = sys.argv[7]
	IMAGE_PATH = f'{os.path.dirname(__file__)}/datasets/images/{image_file}'

	ret = []
	for i in range(1, 6):
		ret.append(predict(sys.argv[i], sys.argv[6]))

	print(ret)
else:
	# 아마 image path도 달라질 것
	image_file = sys.argv[7]
	IMAGE_PATH = f'{os.path.dirname(__file__)}/datasets/images/{image_file}'
 
	ret = [0]
	ret.append(predict_with_captioning(IMAGE_PATH, sys.argv[6]))

	print(ret)

print(f'PREDICTED: {max(ret)}');