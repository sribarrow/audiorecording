#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Sep 11 00:11:17 2019

@author: sripriya
"""
import os
from tqdm import tqdm
import pandas as pd
import numpy as np
import librosa
from scipy.io import wavfile
import glob

def envelope(y, rate, threshold):
    mask=[]
    y = pd.Series(y).apply(np.abs)
    y_mean = y.rolling(window=int(rate/10), min_periods=1, center=True).mean()
    for mean in y_mean:
        if mean > threshold:
            mask.append(True)
        else:
            mask.append(False)
    return mask

rewrite = True
clean = True


# Rewrite csv filelist for to be cleaned files
if rewrite:
    print('rewriting clean csv...')
    nf = pd.DataFrame(columns=['filename', 'label', 'dir'])
    row_ind = 0
    
    dir=['train','valid','test']
    classes=['kalyani', 'kamboji', 'mohanam']
    if os.path.isfile('./audio_clean.csv'):
        print('Deleting file audio_clean.csv')
        os.remove('./audio_clean.csv')

    for d in dir:
        for c in classes:
            srcpath = './' + d + '/' + c + '/'
            destpath = './clean/' + d + '/' + c + '/'
            files = glob.glob(srcpath + '*.wav')
            for f in files:
                filename=os.path.basename(f)
                #print(d, c, filename)
                nf.loc[row_ind, 'filename'] = filename
                nf.loc[row_ind, 'label'] = c
                nf.loc[row_ind, 'dir'] = d
                row_ind+=1

# Write to csv
nf.to_csv('./audio_clean.csv',index=False)
# Read file
df = pd.read_csv('./audio_clean.csv') 

for f in tqdm(df.filename):
    c = df.loc[df['filename'] == f, 'label'].iloc[0]
    d = df.loc[df['filename'] == f, 'dir'].iloc[0]
    src = './' + d + '/' + c + '/' + f
    dest = './clean/' + d + '/' + c + '/' + f
    #print(src, dest)
    #clean and copy files to clean directory
    if clean:
        signal, rate = librosa.load(src, sr=16000)
        mask=envelope(signal, rate, 0.0005)
        if os.path.isfile(dest):
            os.remove(dest)
        wavfile.write(filename=dest, rate=rate, data=signal[mask])

    
   