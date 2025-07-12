import PublicGame from "@/components/PublicGame";
import axios from "axios";
import moment from "moment";
import { headers } from "next/headers";

export async function generateMetadata({ params, searchParams }, parent) {
  const headerList = headers();
  let pathname = headerList.get("x-current-path-elevation");
 
  const response = await axios.get(`${pathname}/api/games/${params.id}`);
  const game = response.data;

  

  return {
    title: `${game?.title || "Game Details"}`,
    description: `Win a grand prize of $${
      game?.prize_amount
    }. Deadline: ${moment(game?.deadline).format("MM/DD/YYYY")}`,
    openGraph: {
      images: [
        {
          url: [`${pathname}/logo.png`],
          width: 100,
          height: 100,
        },
      ],
    },
  };
}

export default async function Page({ params }) {
  const headerList = headers();
  const pathname = headerList.get("x-current-path-elevation");
  const response = await axios.get(`${pathname}/api/games/${params.id}`);
  const game = response.data;

  return (
    <PublicGame game={game} />
  )

  


}
