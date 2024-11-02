with open('rasputin_pose_vectors.txt', 'r') as file:
    lines = file.readlines()

for line in lines:
    line = line[1:-1].split(",");
    if (len(line) != 99):
        print(len(line))
