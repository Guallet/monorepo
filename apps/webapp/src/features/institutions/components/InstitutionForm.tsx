import React, { useState } from "react";

interface InstitutionFormProps {
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const InstitutionForm: React.FC<InstitutionFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [imageSrc, setImageSrc] = useState(initialValues?.image_src || "");
  const [countries, setCountries] = useState(
    initialValues?.countries?.join(",") || ""
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      image_src: imageSrc,
      countries: countries.split(",").map((country: string) => country.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="imageSrc">Image URL:</label>
        <input
          type="text"
          id="imageSrc"
          value={imageSrc}
          onChange={(e) => setImageSrc(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="countries">Countries (comma-separated):</label>
        <input
          type="text"
          id="countries"
          value={countries}
          onChange={(e) => setCountries(e.target.value)}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default InstitutionForm;
