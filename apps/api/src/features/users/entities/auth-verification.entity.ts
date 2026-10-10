import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('verification')
export class AuthVerification {
  @PrimaryColumn('text')
  id: string;

  @Index('verification_identifier_idx')
  @Column({ type: 'text' })
  identifier: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
