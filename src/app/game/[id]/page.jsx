import axios from "axios";
import moment from "moment";
import Head from "next/head";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/games/${id}`
    );

    if (!response.data?.redirect) {
      return {
        redirect: {
          destination: `/signup`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        game: response.data,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}

export default async function Page({ params, game }) {
  const headerList = headers();
  const pathname = headerList.get("x-current-path-elevation");
  const response = await axios.get(`${pathname}/api/games/${params.id}`);

  if (!response.data?.redirect) {
    redirect(`${pathname}/signup`);
  }

  return (
    <>
      <Head>
        <title>{game?.title || "Game Details"}</title>
        <meta property="og:title" content={`${game?.title} - Join Now!`} />
        <meta
          property="og:description"
          content={`Win a grand prize of $${
            game?.prize_amount
          }. Deadline: ${moment(game?.deadline).format("MM/DD/YYYY")}`}
        />
        <meta property="og:url" content={`${pathname}/games/${params.id}`} />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={`${pathname}/logo.png`}
        />
      </Head>
    </>
  );
}
