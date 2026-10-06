import type { Metadata } from "next";
import PillarPage from "@/components/PillarPage";

export const metadata: Metadata = {
  title: "Photo & Film",
  description: "Wedding, birthday and event photography and film across London, Ontario.",
};

export default function PhotoFilmPage() {
  return <PillarPage id="photo-film" heading="The whole night, kept." />;
}
