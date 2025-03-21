import PublicGameTrivia from "@/components/PublicGameTrivia";
import axios from "axios";
import moment from "moment";
import Head from "next/head";
import { headers } from "next/headers";

export async function generateMetadata({ params, searchParams }, parent) {
  const headerList = headers();
  const {time, correct, question, referral} = searchParams
  let pathname = headerList.get("x-current-path-elevation");
  if (pathname.includes("http://")) {
    // pathname = pathname.replace("http://", "https://");
  }

  const response = await axios.get(`${pathname}/api/trivia/game/${params.id}`);
  const game = response.data;

  let description

  if(referral){
    description = `Gave correct answers ${correct} out of ${question} in ${time} sec. Join now using my referral code - ${referral} and win exciting prizes.`
  } else {
    description = `Join and win exciting prizes`
  }

  return {
    title: `${game?.game?.title || "Game Details"}`,
    description:  description,
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


  const response = await axios.get(`${pathname}/api/trivia/game/${params.id}`);
  const game = response.data;

  

  return (
    <PublicGameTrivia game={game} />
  )

}
