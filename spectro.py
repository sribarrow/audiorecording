#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Sep  9 23:12:02 2019

@author: sripriya
"""

# feature extractoring and preprocessing data
from IPython import get_ipython
get_ipython().run_line_magic('matplotlib', 'inline')

import librosa
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
#%matplotlib inline
import os
from PIL import Image
import pathlib
import csv

# Preprocessing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

#Keras
import keras

import warnings
warnings.filterwarnings('ignore')

cmap = plt.get_cmap('inferno')

plt.figure(figsize=(10,10))
genres = 'kalyani kamboji mohanam'.split()
for g in genres:
#    pathlib.Path(f'./train/{g}').mkdir(parents=True, exist_ok=True)     
    for filename in os.listdir(f'./assets/audio/samples/train/'):
        print(filename)
        songname = f'./assets/audio/samples/train/{filename}'
        print(songname)
#        y, sr = librosa.load(songname, mono=True, duration=5)
#        plt.specgram(y, NFFT=2048, Fs=2, Fc=0, noverlap=128, cmap=cmap, sides='default', mode='default', scale='dB');
#        plt.axis('off');
#        plt.savefig(f'img_data/{g}/{filename[:-3].replace(".", "")}.png')
#        plt.clf()