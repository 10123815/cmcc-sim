import matplotlib
import matplotlib.pyplot as plt
import numpy as np 
import math

infile = open('output.txt', 'r')
inlist = infile.readlines()
infile.close()
x = range(200)
plt.plot(x, inlist[:200])
plt.show()