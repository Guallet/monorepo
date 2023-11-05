import { Group, Stack } from "@mantine/core";
import { FeatureCards } from "~/components/FeatureCards/FeatureCards";
import { Footer } from "~/components/Footer/Footer";
import { HeroCard } from "~/components/HeroCard/HeroCard";
import { InviteForm } from "~/components/InviteForm/InviteForm";

export default function Index() {
  return (
    <Stack>
      <HeroCard />
      <FeatureCards />
      <InviteForm />
      <Footer />
    </Stack>
  );
}
