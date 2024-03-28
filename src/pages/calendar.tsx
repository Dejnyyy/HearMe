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

  // Funkce pro formátování data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString('cz-CS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    return formattedDate.replace(',', ', '); // Přidání mezer po čárce
  };

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white items-center justify-center bg-gray-950 text-lg  font-mono font-semibold">
        <section>
          <div className='text-center'>
            <h1 >Calendar</h1>
          </div>
          <div>
            <h2>Votes:</h2>
            <ul>
              {votes.map((vote, index) => (
                <div key={index} className="border-white border rounded-md px-4 py-2">
                  <li className=''>
                    <p>{formatDate(vote.createdAt)}</p>
                    <p>Song: {vote.song}</p>
                    <p>+/-: {vote.voteType}</p>
                    <p>Artist: {vote.artist}</p>
                  </li>
                </div>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Calendar;
