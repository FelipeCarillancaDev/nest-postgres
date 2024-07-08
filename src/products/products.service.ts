import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "../common/dto/pagination.dto";
import { validate as isUUID } from "uuid";
import { ProductImages, Product } from "./entities";

@Injectable()
export class ProductsService {
    private readonly logger = new Logger("ProductsService");

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductImages)
        private readonly productImageRepository: Repository<ProductImages>,
        private readonly dataSource: DataSource,
    ) {}
    async create(createProductDto: CreateProductDto) {
        try {
            const { images = [], ...productDetails } = createProductDto;
            const newProduct: Product = this.productRepository.create({
                ...productDetails,
                images: images.map(image => this.productImageRepository.create({ url: image })),
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
        const products = await this.productRepository.find({
            take: limit,
            skip: offset,
            relations: {
                images: true,
            },
        });
        return products.map(products => ({
            ...products,
            images: products.images.map(image => image.url),
        }));
    }

    //queryBuild consultas mas complejas
    async findOne(term: string) {
        let product: Product;

        if (isUUID(term)) {
            product = await this.productRepository.findOneBy({ id: term });
        } else {
            const queryBuild = this.productRepository.createQueryBuilder("prod");
            product = await queryBuild
                .where("UPPER(title)=:title or slug=:slug", {
                    title: term.toUpperCase(),
                    slug: term.toLowerCase(),
                })
                .leftJoinAndSelect("prod.images", "prodImages")
                .getOne();
        }
        if (!product) throw new NotFoundException(`Product with ${term} not found`);
        return product;
    }

    async findOnePlain(term: string) {
        const { images = [], ...product } = await this.findOne(term);
        return {
            ...product,
            images: images.map(image => image.url),
        };
    }

    //preload es una consulta mas rapida
    async update(id: string, updateProductDto: UpdateProductDto) {
        const { images, ...toUpdate } = updateProductDto;

        const product: Product = await this.productRepository.preload({
            id,
            ...toUpdate, //spread operator para clonar el objeto/esparcir elementos
        });
        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }
        //create query runner
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (images) {
                await queryRunner.manager.delete(ProductImages, { product: { id } });

                product.images = images.map(image => this.productImageRepository.create({ url: image }));
            }
            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            await queryRunner.release();

            return this.findOnePlain(id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.handlerDBExceptions(error);
        }
    }

    async remove(id: string) {
        const product: Product = await this.findOne(id);
        await this.productRepository.remove(product);
    }

    private handlerDBExceptions(error: any) {
        if (error.code === "23505") {
            throw new BadRequestException(error.detail);
        }
        this.logger.error(error);
        throw new InternalServerErrorException("Unexpected error, check server logs");
    }

    async deleteAllProducts() {
        const query = this.productRepository.createQueryBuilder("product");
        try {
            return await query.delete().where({}).execute();
        } catch (error) {
            this.handlerDBExceptions(error);
        }
    }
}
