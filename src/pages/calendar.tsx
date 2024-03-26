import { useState, useEffect } from 'react';
import HamburgerMenu from './components/HamburgerMenu';

const Calendar: React.FC = () => {
  const [votes, setVotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch('/api/getVotes');
        if (!response.ok) {
          throw new Error('Failed to fetch votes');
        }
        const votesData = await response.json();
        setVotes(votesData);
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };

    fetchVotes();
  }, []);

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white items-center justify-center bg-black text-lg cursor-pointer font-mono font-semibold">
        <section>
          <div>
            <h1>Calendar</h1>
          </div>
          <div>
            <h2>Votes:</h2>
            <ul>
              {votes.map((vote, index) => (
                <li key={index} className='flex flex-row'>
                  <p>{vote.song} </p>
                  <p>{vote.voteType}</p>
                  <p>Artist: {vote.artist}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Calendar;
