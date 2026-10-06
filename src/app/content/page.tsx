import type { Metadata } from "next";
import PillarPage from "@/components/PillarPage";

export const metadata: Metadata = {
  title: "Content",
  description: "Reels, personal brand shoots and behind-the-scenes content for creators and small businesses in Ontario.",
};

export default function ContentPage() {
  return <PillarPage id="content" heading="Content that looks like you, every week." />;
}
