import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImages {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  url: string;

  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}
