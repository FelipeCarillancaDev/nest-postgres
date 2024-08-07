import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImages } from './product-images.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true, nullable: false })
  title: string;

  @Column('float', { default: 0 })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImages, productImages => productImages.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImages[];

  @BeforeInsert()
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.formatSlug(this.slug);
  }

  @BeforeUpdate()
  checkUpdateSlug() {
    this.slug = this.formatSlug(this.slug);
  }

  formatSlug(slug: string) {
    return slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }
}
