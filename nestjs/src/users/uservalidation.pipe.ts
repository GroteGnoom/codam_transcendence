import {
  ArgumentMetadata,
  Injectable,
  Logger,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserValidationPipe implements PipeTransform {
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private trim_username(values) {
    Object.keys(values).forEach(key => {
      if (key === 'username') {
        values[key] = values[key].trim(); // delete whitespaces before and after username
      }
    })
    return values;
  }

  async transform(values: any, metadata: ArgumentMetadata) {
    // this.logger.log("-------value:" + values);
    // this.logger.log("-------metadata.type:" + metadata.type);
    // this.logger.log("-------metadata.metatype:" + metadata.metatype);
    // this.logger.log("-------metadata.data:" + metadata.data);
    if (!metadata.type || !this.toValidate(metadata.metatype)) {
      return values;
    }
    if (values !== null && metadata.type === 'body')
      this.trim_username(values);
    const object = plainToInstance(metadata.metatype, values);
    const errors = await validate(object);
    if (errors.length > 0) { // if multiple errors found, return first found error
      throw new BadRequestException(errors[0].constraints[Object.keys(errors[0].constraints)[0]]); // only throw message first error
    }
    return values;
  }
}
