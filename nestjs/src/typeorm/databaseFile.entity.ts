import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
 
@Entity()
export class DatabaseFile {
  @PrimaryGeneratedColumn({
    type: 'bigint'
  })
  public id: number;
 
  @Column()
  filename: string;
 
  @Column({
    type: 'bytea',
  })
  data: Uint8Array;
}
