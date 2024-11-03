function getVertices(vectorData:string) {
    // Read the file synchronously and split into lines
    const lines = vectorData.split('\n').filter(Boolean);

    const res:any[] = [];
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

function calVector(p1:any[], p2:any[]) {
    // Calculates the vector from p1 to p2
    return [
        p2[0] - p1[0],
        p2[1] - p1[1],
        p2[2] - p1[2]
    ];
}

function calVector2(p1:Vector, p2:Vector) {
    // Calculates the vector from p1 to p2
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: p2.z - p1.z
    };
}

function groupVertices2(data:Vector[]) {
    const res:any[] = [];
    res.push(calVector2(data[14], data[16]));
    res.push(calVector2(data[12], data[14]));
    res.push(calVector2(data[11], data[12]));
    res.push(calVector2(data[11], data[13]));
    res.push(calVector2(data[13], data[15]));
    res.push(calVector2(data[12], data[24]));
    res.push(calVector2(data[11], data[23]));
    res.push(calVector2(data[24], data[23]));
    res.push(calVector2(data[24], data[26]));
    res.push(calVector2(data[23], data[25]));
    res.push(calVector2(data[26], data[28]));
    res.push(calVector2(data[25], data[27]));

    return res;
}

function groupVertices(data:any[]) {
    /*
    Order of points:
      left_wrist_elbow, left_elbow_shoulder, shoulder_shoulder,
      right_elbow_shoulder, right_wrist_elbow, left_torso, right_torso, hips,
      left_hip_knee, right_hip_knee, left_knee_feet, right_knee_feet
    */
    const res:any[] = [];

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

function unitVector(vector:any[]) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return {
        x: vector[0] / magnitude,
        y: vector[1] / magnitude,
        z: vector[2] / magnitude
    };
}

function unitVector2(vector:Vector) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude,
        z: vector.z / magnitude
    };
}

interface Vector {
    x: number;
    y: number;
    z: number;
}

function angleBetween(v1:any[], v2:Vector) {
    const v1_u = unitVector(v1);
    const v2_u = unitVector2(v2);

    const dotProduct = v1_u.x * v2_u.x + v1_u.y * v2_u.y + v1_u.z * v2_u.z;
    const clampedDotProduct = Math.min(1, Math.max(-1, dotProduct));

    return Math.acos(clampedDotProduct);
}
const MAX_SCORE = 1000;

function score(angle_btw:any[]) {
    const normalize_angle = angle_btw.map(angle => angle / Math.PI);
    const weights = [0.125, 0.10, 0.05, 0.10, 0.125, 0.05, 0.05, 0.05, 0.05, 0.05, 0.125, 0.125].map(weight => weight * MAX_SCORE);
    const weighted_sum = normalize_angle.reduce((sum, angle, i) => sum + angle * weights[i], 0);

    return MAX_SCORE - weighted_sum;
}

export default function calculateScore(vectorData:string, currentData:any[], currentTime:number) {
    // console.log(vectorData);
    // console.log(currentData.flat());
    const vid1 = groupVertices(getVertices(vectorData));
    const vid2 = groupVertices2(currentData.flat());
    const data = [];
    const integerTime = Math.round(currentTime);
    
    for (let i = 0; i < 12; i++) {
        data.push(angleBetween(vid1[integerTime][i], vid2[i]));
    }

    const s = score(data);

    return s;
}

