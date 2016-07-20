import matplotlib
import matplotlib.pyplot as plt
import numpy as np 
import math

# infile = open('output.txt', 'r')
# inlist = infile.readlines()
# infile.close()
# x = range(200)
# plt.plot(x, inlist[:200])
# plt.show()

def average_file_data(file_name):
    infile = open(file_name, 'r')
    inlist = [float(x) for x in infile.readlines()]
    infile.close()
    return sum(inlist) / len(inlist)

print average_file_data('output.txt')
    