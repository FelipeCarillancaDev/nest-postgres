import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImages, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImages)
    private readonly productImage: Repository<ProductImages>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const newProduct: Product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) => this.productImage.create({ url: image })),
      });
      await this.productRepository.save(newProduct);
      return {
        ...newProduct,
        images,
      };
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  async findAll({ limit = 10, offset = 0 }: PaginationDto) {
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  //queryBuild consultas mas complejas
  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuild = this.productRepository.createQueryBuilder();
      product = await queryBuild
        .where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }
    return product;
  }

  //preload es una consulta mas rapida
  async update(id: string, updateProductDto: UpdateProductDto) {
    const product: Product = await this.productRepository.preload({
      id,
      ...updateProductDto, //spread operator para clonar el objeto/esparcir elementos
      images: [],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handlerDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
