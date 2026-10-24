import { User } from '../../users/entities/user.entity';
import { ForeignKey, Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
@Entity('classification_state')
export class ClassificationState extends BaseDbEntity {
  @ForeignKey(() => User, 'id', {
    name: 'classification_state_owner',
    onDelete: 'CASCADE',
  })
  @PrimaryColumn('text')
  user_id: string;
  @Column({ default: 1 }) revision: number;
  @Column({ type: 'uuid', nullable: true }) inbox_cursor: string | null;
}
