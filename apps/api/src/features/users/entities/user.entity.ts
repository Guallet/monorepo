import { UserRole } from 'src/auth/user-principal';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  // This is the same ID as the one returned by the Auth Provider (Supabase at this time)
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  profile_image_url: string;

  @Column({
    // type: 'set',
    type: 'simple-array',
    default: [],
    nullable: true,
  })
  roles: UserRole[];

  // relations

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
