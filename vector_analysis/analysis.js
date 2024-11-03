const fs = require('fs');

function getVertices(filename) {
    // Read the file synchronously and split into lines
    const lines = fs.readFileSync(filename, 'utf-8').split('\n').filter(Boolean);

    const res = [];
    lines.forEach(line => {
        line = line.trim();
        // Remove first and last character and split by commas
        const values = line.slice(1, -1).split(',');
        
        const newArr = [];
        for (let i = 0; i < values.length; i += 3) {
            newArr.push([
                parseFloat(values[i]), 
                parseFloat(values[i + 1]), 
                parseFloat(values[i + 2])
            ]);
        }
        res.push(newArr);
    });

    return res;
}

function calVector(p1, p2) {
    // Calculates the vector from p1 to p2
    return [
        p2[0] - p1[0],
        p2[1] - p1[1],
        p2[2] - p1[2]
    ];
}

function groupVertices(data) {
    /*
    Order of points:
      left_wrist_elbow, left_elbow_shoulder, shoulder_shoulder,
      right_elbow_shoulder, right_wrist_elbow, left_torso, right_torso, hips,
      left_hip_knee, right_hip_knee, left_knee_feet, right_knee_feet
    */
    const res = [];

    data.forEach(moment => {
        const newArr = [];
        newArr.push(calVector(moment[14], moment[16]));
        newArr.push(calVector(moment[12], moment[14]));
        newArr.push(calVector(moment[11], moment[12]));
        newArr.push(calVector(moment[11], moment[13]));
        newArr.push(calVector(moment[13], moment[15]));
        newArr.push(calVector(moment[12], moment[24]));
        newArr.push(calVector(moment[11], moment[23]));
        newArr.push(calVector(moment[24], moment[23]));
        newArr.push(calVector(moment[24], moment[26]));
        newArr.push(calVector(moment[23], moment[25]));
        newArr.push(calVector(moment[26], moment[28]));
        newArr.push(calVector(moment[25], moment[27]));
        res.push(newArr);
    });

    return res;
}

function calVector(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
}

function unitVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
}

function angleBetween(v1, v2) {
    const v1_u = unitVector(v1);
    const v2_u = unitVector(v2);

    const dotProduct = v1_u.reduce((sum, val, i) => sum + val * v2_u[i], 0);
    const clampedDotProduct = Math.min(1, Math.max(-1, dotProduct));

    return Math.acos(clampedDotProduct);
}
const MAX_SCORE = 1000;

function score(angle_btw) {
    const normalize_angle = angle_btw.map(angle => angle / Math.PI);
    const calc_angle = normalize_angle.map(angle => Math.exp(-2 * angle));
    const weights = [0.125, 0.10, 0.05, 0.10, 0.125, 0.05, 0.05, 0.05, 0.05, 0.05, 0.125, 0.125].map(weight => weight * MAX_SCORE);
    const weighted_sum = calc_angle.reduce((sum, angle, i) => sum + angle * weights[i], 0);

    return weighted_sum;
}

const vid1 = groupVertices(getVertices("ras_pose_vectors.txt"));
const vid2 = groupVertices(getVertices("ras2_pose_vectors.txt"));

const data = [];
const iterations = Math.min(vid1.length, vid2.length);

for (let i = 0; i < iterations; i++) {
    const angles = [];
    for (let j = 0; j < 12; j++) {
        angles.push(angleBetween(vid1[i][j], vid2[i][j]));
    }
    data.push(angles);
}

console.log(data);