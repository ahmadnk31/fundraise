export declare class S3Service {
    static uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
    static deleteFile(key: string): Promise<void>;
    static getSignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
    static getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    static generateFileKey(userId: string, type: 'campaign' | 'profile' | 'update', filename: string): string;
}
