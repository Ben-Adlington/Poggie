import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Emote' })
export class Emote {
  @PrimaryGeneratedColumn({ name: 'EmoteId', type: 'integer' })
  emoteId!: number;

  @Column({ name: 'TwitchEmoteId', type: 'integer' })
  twitchEmoteId!: number;

  @Column({ name: 'CreatedAt', type: 'bigint' })
  createdAt!: number;
}
