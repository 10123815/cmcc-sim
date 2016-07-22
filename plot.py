import math

import matplotlib
import matplotlib.pyplot as plt
import numpy as np

def lerp(x, y, t):
	ttt = t * t * t
	t = ttt * (3.0 * t * (2.0 * t - 5.0) + 10.0)
	return (1 - t) * x + t * y

def smooth(x, y, step):
    rx = []
    ry = []
    L = len(x)
    for i in xrange(L - 1):
        left = x[i]
        right = x[i + 1]
        xx = left
        while xx < right:
            rx.append(xx)
            res = lerp(y[i], y[i + 1], (xx - left) / (right - left))
            ry.append(res)
            xx += step
    return rx, ry

def average_file_data(file_name):
    infile = open(file_name, 'r')
    inlist = [float(x) for x in infile.readlines()]
    infile.close()
    return sum(inlist) / len(inlist)

def plot_dict(file_name):
    infile = open(file_name, 'r')
    inlist = infile.readlines()
    infile.close()
    x = [float(arr.split(' ')[0]) for arr in inlist]
    y = [float(arr.split(' ')[1]) for arr in inlist]
    (xx, yy) = smooth(x, y, 0.001)
    plt.plot(xx, yy)
    plt.show()

print plot_dict('./result/intro-size')
    