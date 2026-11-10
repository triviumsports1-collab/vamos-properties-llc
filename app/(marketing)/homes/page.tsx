import { permanentRedirect } from "next/navigation";

export default function HomesPage() {
  permanentRedirect("/properties");
}
