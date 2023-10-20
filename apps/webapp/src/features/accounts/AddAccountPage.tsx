import { ActionFunction, Form, redirect, useNavigate } from "react-router-dom";

export const action: ActionFunction = async ({ request, params }) => {
  const { accountId } = params;
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const newAccount = { id: 1 };
  console.log("Calling action with values", updates);
  return redirect(`/accounts/${newAccount.id}`);
};

export function AddAccountPage() {
  const navigate = useNavigate();

  return (
    <Form method="post" id="add-account-form">
      <p>
        <span>Name</span>
        <input
          placeholder="First"
          aria-label="First name"
          type="text"
          name="first"
          defaultValue=""
        />
        <input
          placeholder="Last"
          aria-label="Last name"
          type="text"
          name="last"
          defaultValue=""
        />
      </p>
      <p>
        <button type="submit">Save</button>
        <button
          type="button"
          onClick={() => {
            // Go back
            navigate(-1);
          }}
        >
          Cancel
        </button>
      </p>
    </Form>
  );
}
