#!/usr/bin/env python3

import os
from tqdm import tqdm
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.io import wavfile
from python_speech_features import mfcc, logfbank
import librosa
import librosa.display

def calc_fft(y,rate):
    n = len(y)
    freq = np.fft.rfftfreq(n, d=1/rate)
    Y = abs(np.fft.rfft(y)/n) 
    return(Y, freq)
    
    
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


def save_spec(y,sr, out,label,d):
    plt.interactive(False)
    #filename='./nexxx/images/spectro/'+ d + '/' + label+'/sp_'+out
    filename='./images/spectro/'+ d + '/' + label+'/sp_'+out
    fig = plt.figure(figsize=[0.72,0.72])
    ax = fig.add_subplot(111)
    ax.axes.get_xaxis().set_visible(False)
    ax.axes.get_yaxis().set_visible(False)
    ax.set_frame_on(False)
    S = librosa.feature.melspectrogram(y=y, sr=sr,n_fft=2048, hop_length=512)
    librosa.display.specshow(librosa.power_to_db(S, ref=np.max))
    plt.savefig(filename, dpi=400, bbox_inches='tight',pad_inches=0)
    plt.close()    
    fig.clf()
    plt.close(fig)
    plt.close('all')
    #del filename,y,sr,fig,ax,S
    
    
def clr_dir(ind):
    #os.chdir('./nexxx/images/spectro/')
    os.chdir('./images/spectro/')
        
    for root, dirs, files in os.walk(".", topdown = False):
        for file in files:
            print(os.path.join(root, file))
            os.remove(os.path.join(root, file))
    os.chdir('../..')


# 1=signal, 2=spectro, 3=fft, 4=fbank, 5=mel
ind=1
clr_dir(ind)
#plt.clf()
#df = pd.read_csv('./assets/res/audio_files.csv')

df = pd.read_csv('./audio_samples.csv')

#df.set_index('filename', inplace=True)
#
#for f in df.index:
#    #print(f)
#    rate, signal = wavfile.read('./samples/train/'+f)
#    #df.at[f, 'length'] = signal.shape[0]/rate
#    
#classes = list(np.unique(df.label))
#
#class_dist = df.groupby(['label'])['length'].mean()
#
#df.reset_index(inplace=True)

signals = {}
fft = {}
fbank = {}
mfccs = {}

for f in df.filename:
    wav_file = f
    #print(f)

    lab = df.loc[df['filename'] == f, 'label'].iloc[0]
    d = df.loc[df['filename'] == f, 'dir'].iloc[0]
    #print(lab)
    filepath='./samples/' + d + '/' + lab + '/' + wav_file
    
    outfile = os.path.splitext(f)[0]+'.png'
    signal, rate = librosa.load(filepath, sr=44100)
    
    #mask = envelope(signal, rate, 0.0005)
    #signal= signal[mask]
    save_spec(signal,rate, outfile,lab, d)


print("done")
#plt.clf()