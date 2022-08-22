import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseFile } from '../typeorm/databaseFile.entity';

@Injectable()
export class DatabaseFilesService {
  constructor(
      @InjectRepository(DatabaseFile) private databaseFilesRepository:
          Repository<DatabaseFile>,
  ) {}

  async uploadDatabaseFile(avatarId: number, dataBuffer: Buffer,
                           filename: string) {
    const newFile =
        this.databaseFilesRepository.create({filename, data : dataBuffer})
    if (avatarId !== null) {
      await this.databaseFilesRepository.update(
          avatarId, {filename : newFile.filename, data : newFile.data}).catch( (e) => {
            throw new BadRequestException('could not update databaseFilesRepository');
          });
    }
    else {
      await this.databaseFilesRepository.save(newFile).catch( (e) => {
        throw new BadRequestException('could not save databaseFilesRepository');
      });
    }
    return newFile;
  }

  async getFileById(id: number) {
    return await this.databaseFilesRepository.findOneBy({id : id});
  }
}
