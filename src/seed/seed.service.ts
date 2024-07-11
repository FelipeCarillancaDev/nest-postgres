import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    return this.insertNewProducts();
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises = [];

    products.forEach(products => {
      insertPromises.push(this.productsService.create(products));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
