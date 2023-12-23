// pages/about.tsx
import Link from 'next/link';

const Calendar: React.FC = () => {
	return (
		<div>
			<main className="flex min-h-screen flex-col text-white items-center justify-center bg-black text-lg cursor-pointer font-mono font-semibold">
				<Link href="/" className='absolute right-10 top-5'>back</Link>
				<section>
					<div>
						<h1>Calendar</h1>
					</div>
				</section>
			</main>
		</div>
	);
};
export default Calendar;
