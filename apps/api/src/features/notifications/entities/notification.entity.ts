import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  IMPORTANT = 'important',
  ACTION_REQUIRED = 'action_required',
}

@Entity('notifications')
export class Notification extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_notifications',
  })
  id: string;

  @Column()
  user_id: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({ nullable: true })
  action?: string;

  @Column({ default: false })
  is_read: boolean;
}
