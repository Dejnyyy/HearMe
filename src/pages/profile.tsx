// Profile component
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

const Profile: React.FC = () => {
	const router = useRouter();
	const { image } = router.query;
    const { data: sessionData } = useSession();

	return (
		<div>
			<main className="flex min-h-screen flex-col text-white bg-black items-center justify-center text-lg  font-mono font-semibold">
				<Link href="/" className="absolute right-10 top-5">
					back
				</Link>
				<section>
					<div>
						<h1 className='text-center my-3'>Dejny</h1>
                        <AuthShowcase />
					</div>
				</section>
				<div className="grid gap-x-60 my-5 grid-cols-3">
					<div>Favourite Artist</div>
                    <div><span>Votes</span> - <span>Registered Date</span></div>
					<div>Favourite Album</div>
				</div>
                <h2>Activity</h2>
                <div className="activity w-4/12 h-24 bg-stone-50 rounded-xl my-5"></div>
                <div className="activity w-3/12 h-12 bg-stone-50 rounded-full my-5"><h1 className='text-black mt-2 text-center'>Today's Vote</h1></div>
			</main>
		</div>
	);
};

function AuthShowcase() {
    const { data: sessionData } = useSession();
  
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-center text-2xl text-white">
          {sessionData && 
          <div>
            <Image
               className="rounded-full w-24 h-24 shadow-white shadow-md"
               src={sessionData.user?.image ?? ""}
               alt={"pfp of user" + sessionData.user?.name}
               width={250}
               height={250} 
            />
          </div>
          }
        </p>
      </div>
    );
  }
  

export default Profile;
