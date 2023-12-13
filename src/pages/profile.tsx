// pages/about.tsx
import Link from 'next/link';

const Profile: React.FC = () => {
	return (
		<div>
			<main className="flex min-h-screen flex-col text-white items-center justify-center bg-gradient-to-b from-[#000000] to-[#481b48] text-lg cursor-pointer font-mono font-semibold">
				<Link href="/" className='absolute right-10 top-5'>back</Link>
				<section>
					<div>
						<h1> Dejny</h1>
					</div>
				</section>
			</main>
		</div>
	);
};
export default Profile;
