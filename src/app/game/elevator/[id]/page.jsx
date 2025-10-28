import PublicGame from "@/components/PublicGame";
import axios from "axios";
import moment from "moment";
import { headers } from "next/headers";

export async function generateMetadata({ params }) {
  const headerList = headers();
  const pathname = headerList.get("x-current-path-elevation");

  try {
    const response = await axios.get(`${pathname}/api/games/${params.id}`);
    const game = response.data;

    return {
      title: game?.title ? `Search for ${game.title}` : "Game Details",
      description: `Win a grand prize of $${game.prize_amount}. Target Deadline Date: ${moment(game.deadline).format("MM/DD/YYYY")}`,
      openGraph: {
        images: [
          {
            url: `${pathname}/logo.png`,
            width: 100,
            height: 100,
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: "Game not found or has been removed",
      description: "The requested game could not be found.",
    };
  }
}

export default async function Page({ params }) {
  const headerList = headers();
  const pathname = headerList.get("x-current-path-elevation");
  let game = null;

  try {
    const response = await axios.get(`${pathname}/api/games/${params.id}`);
    game = response.data;
  } catch (error) {
    console.log(error)
    console.log("Game not found or has been removed");
  }

  return <PublicGame game={game} />;
}
