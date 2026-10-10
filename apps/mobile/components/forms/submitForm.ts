/** Guard native button and keyboard submissions against concurrent requests. */
export async function submitForm(form: {
  state: { isSubmitting: boolean };
  handleSubmit: () => Promise<void>;
}): Promise<void> {
  if (form.state.isSubmitting) return;
  await form.handleSubmit();
}
