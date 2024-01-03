// pages/ranking.tsx
import Link from 'next/link';
import HamburgerMenu from "./components/HamburgerMenu";

const Ranking: React.FC = () => {
	return (
		<div>
			<HamburgerMenu />
			<main className="flex min-h-screen flex-col text-white items-center justify-center bg-black text-lg  font-mono font-semibold">
				<Link href="/" className='absolute right-10 top-5'>back</Link>
				<section>
					<div>
						<h1>Ranking</h1>
					</div>
				</section>
			</main>
		</div>
	);
};
export default Ranking;
