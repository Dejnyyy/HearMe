// pages/ranking.tsx
import HamburgerMenu from "./components/HamburgerMenu";

const Ranking: React.FC = () => {
	return (
		<div>
			<HamburgerMenu />
			<main className="flex min-h-screen flex-col text-white items-center justify-center text-lg  font-mono font-semibold"style={{background: 'radial-gradient(circle, #777, #000)'}}>
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
