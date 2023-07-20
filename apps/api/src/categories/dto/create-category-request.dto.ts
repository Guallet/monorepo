export class CreateCategoryRequestDto {
  name: string;
  icon: string;
  colour: string;
  parentId?: string | null;
}
