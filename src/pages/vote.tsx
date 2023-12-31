// pages/vote.tsx
import Link from 'next/link';

const Vote: React.FC = () => {
	return (
		<div>
			<main className="flex min-h-screen flex-col text-white items-center justify-center bg-black text-lg  font-mono font-semibold">
				<Link href="/" className='absolute right-10 top-5'>back</Link>
				<section>
					<div>
						<h1>Vote</h1>
					</div>
				</section>
				<div className='w-96 h-96 my-2 shadow-md shadow-white rounded-lg'>
				</div>
			</main>
		</div>
	);
};
export default Vote;
