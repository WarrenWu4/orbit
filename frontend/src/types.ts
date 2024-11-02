export interface DanceVideoMetaData {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    video: string;
    location: string;
    vectors: {[timestamp: number]: VectorData};
}

export interface VectorData {

}