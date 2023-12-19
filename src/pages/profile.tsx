// Profile component
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

const Profile: React.FC = () => {
	const router = useRouter();
	const { image } = router.query;

	return (
		<div>
			<main className="flex min-h-screen flex-col text-white items-center justify-center bg-gradient-to-b from-[#000000] to-[#481b48] text-lg  font-mono font-semibold">
				<Link href="/" className="absolute right-10 top-5">
					back
				</Link>
				<section>
					<div>
						<h1>Dejny</h1>
					</div>
				</section>
				<div className="grid gap-x-60 my-5 grid-cols-3">
					<div>Favourite Artist</div>
                    <div><span>Votes</span> - <span>Registered Date</span></div>
					<div>Favourite Album</div>
				</div>
                <h2>Activity</h2>
                <div className="activity w-4/12 h-24 bg-stone-50 rounded-md my-5"></div>
			</main>
		</div>
	);
};

export default Profile;
