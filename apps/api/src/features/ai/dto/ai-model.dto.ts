export class AiModelDto {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  contextLength?: number;
  inputModalities?: string[];
  outputModalities?: string[];
}
