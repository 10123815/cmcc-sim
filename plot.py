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
    inlist = [float(x) for x in infile.readlines() if not math.isnan(float(x))]
    infile.close()
    return sum(inlist) / len(inlist)

def plot_dict(file_name):
    infile = open(file_name, 'r')
    inlist = infile.readlines()
    infile.close()
    x = [float(arr.split(' ')[0]) for arr in inlist]
    y = [float(arr.split(' ')[1]) for arr in inlist]
    # (x, y) = smooth(x, y, 0.001)
    plt.plot(x, y)
    plt.show()

# print plot_dict('./result/intro-size-bw-smallml')
    
def plot_arr(file_name):
    infile = open(file_name)
    inlist = infile.readlines()
    infile.close()
    x = len(inlist)
    y = []
    for i in xrange(x):
        try:
            y.append(float(inlist[i]))
        except ValueError:
            x -= 1
    x = range(x)
    [x, y] = smooth(x, y, 0.1)
    plt.plot(x, y)
    plt.show()

def plot_arrs(file_names, colors):
    count = len(file_names)
    for i in xrange(count):
        infile = open(file_names[i])
        inlist = infile.readlines()
        infile.close()
        x = len(inlist)
        y = []
        for j in xrange(x):
            try:
                y.append(float(inlist[j]))
            except ValueError:
                x -= 1
        x = range(x)
        [x, y] = smooth(x, y, 0.1)
        plt.plot(x, y, color = colors[i])
    plt.show()

def average_plot(file_names):
    count = len(file_names)
    y = []
    for i in xrange(count):
        ave = average_file_data(file_names[i])
        y.append(ave)
    w = 0.07
    x = [0.05, 0.25, 0.45]
    rects1 = plt.bar(x, y, width = w)
    plt.tight_layout()
    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            plt.text(rect.get_x() + w / 5, 1.03 * height, '%s' % '%.3f' % float(height)) 
    autolabel(rects1)
    plt.legend()
    ax = plt.axes()        
    ax.yaxis.grid() # horizontal lines
    plt.show()

# plot_arr("./output1.txt")
plot_arrs(["./output1.txt", "./output2.txt", "./output3.txt"], ["red", "green", "blue"])
average_plot(["./output1.txt", "./output2.txt", "./output3.txt"])