import { IsArray, IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true }) // cada uno de los elementos debe cumplir con esta validacion
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'kid', 'unisex']) // cada uno de los elementos debe cumplir con esta validacion()
    gender?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];
}
