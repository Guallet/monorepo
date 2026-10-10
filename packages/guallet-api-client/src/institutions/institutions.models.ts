export type InstitutionDto = {
  id: string;
  name: string;
  image_src?: string | null;
  user_id: string | null;
  nordigen_id?: string | null;
  countries: string[];
};

export type CreateInstitutionRequest = {
  name: string;
  image_src?: string;
  country?: string;
};

export type UpdateInstitutionRequest = {
  name?: string;
  image_src?: string | null;
  country?: string;
};
