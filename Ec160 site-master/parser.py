import json

f = open("data/round2-12_1.txt")
#target = open("csv/run1479234224572.txt", 'w')


print("time,car_id,position,velocity,lane,distance,crashes")

def csv_line(timestep, car_id, position, velocity, lane, distance, crashes):
    return """{0:0d},{1:0d},{2:0f},{3:0f},{4:0d},{5:0f},{6:0d}""".format(
            timestep, car_id, position, velocity, lane, distance, crashes)

for line in f:
    if line[0] == "{":
        dict_line = json.loads(line)
        time = dict_line["timestep"]
        positions = dict_line["positions"]
        velocities = dict_line["velocities"]
        lanes = dict_line["lanes"]
        distances  = dict_line["distances"]
        crashes    = dict_line["crashes"]

        for car in dict_line["ids"]:
            line = csv_line(time, 
                     car, 
                     positions[str(car)],
                     velocities[str(car)],
                     lanes[str(car)],
                     distances[str(car)],
                     crashes[str(car)])

            print(line)

