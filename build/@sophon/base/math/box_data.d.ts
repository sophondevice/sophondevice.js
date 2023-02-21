export declare class BoundingBoxData {
    static readonly ndcVertices: number[][];
    static generateVertexData(v: number[][]): number[];
    static readonly ndcBoxVertices: Float32Array;
    static readonly boxBarycentric: Float32Array;
    static readonly boxIndices: Uint16Array;
}
