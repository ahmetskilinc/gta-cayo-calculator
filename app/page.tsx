import { HeistCalculator } from "@/components/heist-calculator";
import { Metadata } from "next";

export default function Page() {
  return <HeistCalculator />;
}

export const metadata: Metadata = {
  title: "Cayo Perico Heist Calculator",
  description: "Calculate the earnings of the Cayo Perico heist in GTA Online",
};
