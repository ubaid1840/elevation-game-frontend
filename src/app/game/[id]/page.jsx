import axios from "axios";
import moment from "moment";
import Head from "next/head";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({ params }) {
  const headerList = headers();
  const pathname = headerList.get("x-current-path-elevation");
  const response = await axios.get(`${pathname}/api/games/${params.id}`);

  if (!response.data?.redirect) {
    redirect(`${pathname}/signup`);
  }

  return (
    <>
      <Head>
        <title>{response?.data?.title || "Game Details"}</title>
        <meta
          property="og:title"
          content={`${response?.data?.title} - Join Now!`}
        />
        <meta
          property="og:description"
          content={`Win a grand prize of $${
            response?.data?.prize_amount
          }. Deadline: ${moment(response?.data?.deadline).format(
            "MM/DD/YYYY"
          )}`}
        />
        <meta property="og:url" content={`${pathname}/games/${params.id}`} />
        <meta property="og:type" content="website" />
      </Head>
    </>
  );
}
