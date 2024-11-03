import math
import numpy as np

def get_vertices(filename):
    with open(filename, 'r') as file:
        lines = file.readlines()

    res = []
    for line in lines:
        line = line.strip("\n")
        line = line[1:-1].split(",")
        new_arr = []
        for i in range(0, len(line), 3):
            new_arr.append([float(line[i]), float(line[i+1]), float(line[i+2])])
        res.append(new_arr)
    return res 

def group_vertices(data):
    """
    get new arr of only points we care about
    order will be as follows:
        left_wrist_elbow, left_elbow_shoulder, should_shoulder,
        right_elbow_shoulder, right_wrist_elbow, left_torso, right_torso, hips, left_hip_knee, right_hip_knee, left_knee_feet, right_knee_feet
    """
    res = []
    for moment in data:
        new_arr = []
        new_arr.append(cal_vector(moment[14], moment[16]))
        new_arr.append(cal_vector(moment[12], moment[14]))
        new_arr.append(cal_vector(moment[11], moment[12]))
        new_arr.append(cal_vector(moment[11], moment[13]))
        new_arr.append(cal_vector(moment[13], moment[15]))
        new_arr.append(cal_vector(moment[12], moment[24]))
        new_arr.append(cal_vector(moment[11], moment[23]))
        new_arr.append(cal_vector(moment[24], moment[23]))
        new_arr.append(cal_vector(moment[24], moment[26]))
        new_arr.append(cal_vector(moment[23], moment[25]))
        new_arr.append(cal_vector(moment[26], moment[28]))
        new_arr.append(cal_vector(moment[25], moment[27]))
        res.append(new_arr)
    return res 

def cal_vector(p1, p2):
    # p1 -> p2
    return [p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2]]

def unit_vector(vector):
    return vector / np.linalg.norm(vector)

def angle_between(v1, v2):
    v1_u = unit_vector(v1)
    v2_u = unit_vector(v2)
    return np.arccos(np.clip(np.dot(v1_u, v2_u), -1.0, 1.0))

vid1 = group_vertices(get_vertices("ras_pose_vectors.txt"))
vid2 = group_vertices(get_vertices("ras2_pose_vectors.txt"))
data = []
iterations = min(len(vid1), len(vid2))

for i in range(iterations):
    angles = []
    for j in range(12):
        angles.append(angle_between(vid1[i][j], vid2[i][j]))
    data.append(angles)

MAX_SCORE = 1000

def score(data):
    angle_btw = np.array(data)
    normalize_angle = angle_btw / math.pi
    weights = np.array([0.125, 0.10, 0.05, 0.10, 0.125, 0.05, 0.05, 0.05, 0.05, 0.05, 0.125, 0.125]) * MAX_SCORE
    weighted_sum = np.sum(normalize_angle * weights)
    
    # print(angle_btw * 180.0 / math.pi)
    # print(normalize_angle)
    # print(normalize_angle * weights)
    # print(weighted_sum)
    
    return MAX_SCORE - weighted_sum


        




