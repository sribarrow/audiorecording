#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Sep  8 16:30:51 2019

@author: sripriya
"""
import os
from tqdm import tqdm
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.io import wavfile
from python_speech_features import mfcc, logfbank
import librosa
import wave
import shutil, glob
from pydub import AudioSegment


df = pd.read_csv('./audio_clean.csv')
df.set_index('filename', inplace=True)
#bit_depth = 16 

split_flag = True
add_attr = True

for f in df.index:
    c = df.loc[f]['label']
    d = df.loc[f]['dir']
    src = './clean/' + d + '/' + c + '/' + f
    rate, signal = wavfile.read(src)
    df.at[f, 'length'] = signal.shape[0]/rate
    
classes = list(np.unique(df.label))
#
class_dist = df.groupby(['label'])['length'].mean()
#
fig, ax = plt.subplots()
ax.set_title('Class Distribution', y=1.08)
ax.pie(class_dist, labels=class_dist.index, autopct='%1.1f%%', shadow=False, startangle=90)
ax.axis('equal')
plt.show()
    
df.reset_index(inplace=True)

dir=['train','valid','test']
classes=['kalyani', 'kamboji', 'mohanam']

for d in dir:
    for c in classes:
        #srcpath = './clean/' + d + '/' + c + '/'
        destpath = './samples/' + d + '/' + c + '/'
        print(destpath)
        files = glob.glob(destpath+'*.wav')
        for f in files:
            filename=os.path.basename(f)
            if os.path.isfile(f):
                os.remove(f)
              
if split_flag:
    
    if os.path.isfile('./audio_samples.csv'):
        os.remove('./audio_samples.csv')
    
    nf = pd.DataFrame(columns=['filename', 'label'])
    row_ind = 0
    for f in tqdm(df.filename):
        c = df.loc[df['filename'] == f, 'label'].iloc[0]
        d = df.loc[df['filename'] == f, 'dir'].iloc[0]
        srcpath = './clean/' + d + '/' + c + '/'
        destpath = './samples/' + d + '/' + c + '/'
        print(srcpath)
        audio=AudioSegment.from_wav(srcpath+f)
        
        # len() and slicing are in milliseconds
        l = len(audio)
        #print(l)
        overlap = 3000 * 0.1
        split=3000
        #print(split)
        start=0
        end=split
        counter=1
        
        while (start < l):
            print(start,end)
            chunk = audio[start:end]
            start=end-overlap
            end=end+split-overlap
            sample_file = destpath + '/c0'+str(counter)+f
            #print(end-start)
            if l-start >= split:
                chunk.export(sample_file, format ="wav") 
                print('saving... ' + sample_file)
                nf.loc[row_ind, 'filename'] = 'c0'+str(counter)+f
                nf.loc[row_ind, 'label'] = c
                nf.loc[row_ind, 'dir'] = d
                row_ind+=1
            counter+=1
    nf.to_csv('./audio_samples.csv',index=False)

if add_attr:
    length=[]
    rt=[]
    rf = pd.read_csv('./audio_samples.csv')
    print(rf.columns)
    #rf.set_index('filename', inplace=True)
    for f in rf.filename:
        #print(f)       
        c = rf.loc[rf['filename'] == f, 'label'].iloc[0]
        d = rf.loc[rf['filename'] == f, 'dir'].iloc[0]
        rate, signal = wavfile.read('./samples/'+ d +'/' + c + '/'+ f)
        #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#        obj = wave.open('./samples/'+c+'/'+ f,'r')
#        print( "Number of channels",obj.getnchannels())
#        print ( "Sample width",obj.getsampwidth())
#        print ( "Frame rate.",obj.getframerate())
#        print ("Number of frames",obj.getnframes())
#        print ( "parameters:",obj.getparams())
#        obj.close()
        #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        l=signal.shape[0]/rate
        length.append(l)
        rt.append(rate)
        
#        rf.at[f, 'rate'] = rate
#        rf.at[f, 'bit_depth'] = 16
    print('length added...')
#    rf.reset_index(inplace=True)
    rf['length']=length
    rf['rate']=rt
    rf.to_csv('./audio_samples.csv')
    
   