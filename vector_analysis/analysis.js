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

console.log(angleBetween([0, 0, 1], [1, 0, 0]));
