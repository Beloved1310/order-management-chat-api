import { IsNotEmpty, IsInt, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  specifications: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsOptional()
  metadata: Record<string, any>;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Processing', 'Completed'])
  status: string;
}
