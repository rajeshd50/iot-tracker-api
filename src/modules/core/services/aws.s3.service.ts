import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';
import { ConfigService } from '@nestjs/config';
import { ENV_CONSTANTS } from 'src/config';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { parseUrl } from '@aws-sdk/url-parser';
import { Hash } from '@aws-sdk/hash-node';
import { formatUrl } from '@aws-sdk/util-format-url';
import { HttpRequest } from '@aws-sdk/protocol-http';
import * as fs from 'fs';

export interface S3FileUploadParams {
  fileName: string;
  filePath: string;
}

export interface S3FileUploadResponse {
  key: string;
  etag: string;
  url: string;
}

@Injectable()
export class AwsS3Service {
  private logger = new Logger(AwsS3Service.name);
  private s3client: S3Client = null;
  private preSigner: S3RequestPresigner = null;
  constructor(private configService: ConfigService) {
    this.s3client = new S3Client({
      credentials: fromEnv(),
      region: configService.get<string>(ENV_CONSTANTS.S3_REGION),
    });
    this.preSigner = new S3RequestPresigner({
      credentials: fromEnv(),
      region: configService.get<string>(ENV_CONSTANTS.S3_REGION),
      sha256: Hash.bind(null, 'sha256'),
    });
  }

  public async uploadFile(
    data: S3FileUploadParams,
  ): Promise<S3FileUploadResponse> {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(data.filePath, (err, fileData) => {
          if (err) {
            return reject(err);
          }
          this.s3client
            .send(
              new PutObjectCommand({
                Body: fileData,
                Key: data.fileName,
                Bucket: this.configService.get<string>(
                  ENV_CONSTANTS.S3_FIRMWARE_BUCKET,
                ),
              }),
            )
            .then((output) => {
              fs.unlink(data.filePath, (err) => {});
              return resolve({
                key: data.fileName,
                etag: output.ETag.replace(/\"/g, ''),
                url: this.getS3FIleUrl(data.fileName),
              });
            })
            .catch((error) => {
              return reject(error);
            });
        });
      } catch (error) {
        this.logger.error(`Error while uploading file to s3`, error);
        return reject(error);
      }
    });
  }

  private getS3FIleUrl(fileName: string) {
    return `https://${this.configService.get<string>(
      ENV_CONSTANTS.S3_FIRMWARE_BUCKET,
    )}.s3.${this.configService.get<string>(
      ENV_CONSTANTS.S3_REGION,
    )}.amazonaws.com/${fileName}`;
  }

  public async getPresignedUrl(objectUrl: string, expiresIn: number) {
    try {
      const s3ObjectUrl = parseUrl(objectUrl);
      const url = await this.preSigner.presign(new HttpRequest(s3ObjectUrl), {
        expiresIn,
      });
      return formatUrl(url);
    } catch (error) {
      this.logger.error(`Error while fetching pre signed url`, error);
      throw error;
    }
  }
}
