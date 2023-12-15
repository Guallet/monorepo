import { get } from "../../../../core/api/fetchHelper";

export type InstitutionDto = {
  id: string;
  name: string;
  image_src: string;
  user_id: string | null;
  nordigen_id: string;
  countries: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export async function getUserInstitutions(): Promise<InstitutionDto[]> {
  return await get<InstitutionDto[]>("institutions");
}

export async function getInstitution(id: string): Promise<InstitutionDto> {
  return await get<InstitutionDto>(`institutions/${id}`);
}
