import random

class Queue:
    def __init__(self):
        self.items = []

    def isEmpty(self):
        return self.items == []

    def enqueue(self, item):
        self.items.insert(0, item)

    def dequeue(self):
        return self.items.pop()

    def size(self):
        return len(self.items)

a = Queue()
b = Queue()
c = Queue()

while True:
    cmd = raw_input('Enter a queue item (blank to wait): ')
    ran = random.randint(1, 3)
    if cmd == '':
        ran = 0
    if cmd == 'quit':
        break    
    if ran == 1:
        a.enqueue(cmd)
    if ran == 2:
        b.enqueue(cmd)
    if ran == 3:
        c.enqueue(cmd)
    print '\n' + 'Before Step: '
    print 'Line 1 Length: ' + str(a.size())
    print 'Line 2 Length: ' + str(b.size())
    print 'Line 3 Length: ' + str(c.size())
    print '\n' + 'After Step: '
    ran2 = random.randint(1, 100)
    if ran2 < random.randint(1, random.randint(1, 100)):
        if a.size() != 0:
            a.dequeue()
    if ran2 < random.randint(1, random.randint(1, 100)):
        if b.size() != 0:
            b.dequeue()
    if ran2 < random.randint(1, random.randint(1, 100)):
        if c.size() != 0:
            c.dequeue()   
    print 'Line 1 Length: ' + str(a.size())
    print 'Line 2 Length: ' + str(b.size())
    print 'Line 3 Length: ' + str(c.size()) + '\n'