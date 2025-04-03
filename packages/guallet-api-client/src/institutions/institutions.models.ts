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

export type CreateInstitutionRequest = {
  name: string;
  image_src?: string;
  country?: string;
};

export type UpdateInstitutionRequest = {
  name: string;
  image_src?: string;
  country?: string;
};
