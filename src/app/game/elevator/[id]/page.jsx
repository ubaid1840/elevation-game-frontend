import PublicGame from "@/components/PublicGame";
import axios from "axios";
import moment from "moment";
import Head from "next/head";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function generateMetadata({ params, searchParams }, parent) {
  const headerList = headers();
  let pathname = headerList.get("x-current-path-elevation");
  if (pathname.includes("http://")) {
    // pathname = pathname.replace("http://", "https://");
  }

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
  // const response = await axios.get(`https://d92wqcbk-3000.inc1.devtunnels.ms/api/games/${params.id}`);

  // if (!response.data?.redirect) {
  // redirect(`${pathname}/signup`);
  // }

  // const game = response.data;


  const response = await axios.get(`${pathname}/api/games/${params.id}`);
  const game = response.data;

  return (
    <PublicGame game={game} />
  )

  


}
