# import urllib2
# response = urllib2.urlopen('server URL')
# svrstr = response.read()

import threading
import os

example = '32,125,14,72'
a,b,c,d = example.split(',')

# a,b,c,d = svrstr.split(',')

def printit():
	threading.Timer(1.0, printit).start()
	a_int = int(a)
	b_int = int(b)
	c_int = int(c)
	d_int = int(d)
	print(' '*a_int + '.')
	print(' '*b_int + '.')
	print(' '*c_int + '.')
	print(' '*d_int + '.')
	os.system('clear') # Mac and Linux
	# os.system('cls') # Windows
	
printit()