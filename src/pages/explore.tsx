import React, { useState, useEffect, useRef } from 'react';
import HamburgerMenu from './components/HamburgerMenu';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import Loading from "./components/Loading";

interface Vote {
  id: number;
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl?: string;
  userId: string;
  name?: string;
  image?: string;
}

const Explore: React.FC = () => {
  const { data: sessionData } = useSession();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shownType, setShownType] = useState(true);
  const [loading, setLoading] = useState(true); // Loading state
  const [page, setPage] = useState(1); // Page state for pagination
  const [hasMore, setHasMore] = useState(true); // State to track if there are more votes to load
  const isAdmin = sessionData?.user?.isAdmin;
  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchVotes();
  }, [shownType, page]);

  const fetchVotes = async () => {
    setLoading(true); // Set loading to true before fetching data
    const apiEndpoint = shownType ? `/api/getOptimalVotes?page=${page}&limit=20` : `/api/findMineAndFriendsVotes?page=${page}&limit=20`;
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        console.log('Votes fetch failed');
        setLoading(false); // Set loading to false in case of error
        return;
      }
      const { votes: votesData, totalVotes } = await response.json();
      const votesWithUserDetails = await Promise.all(
        votesData.map(async (vote: Vote) => ({
          ...vote,
          ...await fetchUserDetails(vote.userId),
        }))
      );
      setVotes(prevVotes => [...prevVotes, ...votesWithUserDetails]);
      setHasMore(votes.length + votesWithUserDetails.length < totalVotes);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
      if (!res.ok) {
        console.log('User fetch failed');
        return { name: 'Unknown', image: '/default-profile.png' };
      }
      const userData = await res.json();
      return { name: userData.name, image: userData.image };
    } catch (error) {
      console.error('fetchUserDetails error:', error);
      return { name: 'Unknown', image: '/default-profile.png' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('cz-CS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ', ');
  };

  const sortedVotes = [...votes].sort((a, b) => sortByDateDesc ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const toggleSortingOrder = () => setSortByDateDesc(!sortByDateDesc);
  const toggleTypeShown = () => {
    setVotes([]); // Clear votes when toggling type
    setPage(1); // Reset to first page
    setShownType(!shownType);
  };
  const toggleExpanded = (index: number) => setExpandedIndex(expandedIndex === index ? null : index);

  const sortingButtonText = sortByDateDesc ? "Descendant" : "Ascendant";
  const feedType = shownType ? "World" : "Friends";

  const handleDeleteClick = async (voteId: number) => {
    try {
      const response = await fetch(`/api/deleteVote?voteId=${voteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error('Failed to delete vote');
        return;
      }
      setVotes(prevVotes => prevVotes.filter(vote => vote.id !== voteId));
    } catch (error) {
      console.error('Error deleting vote:', error);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const lastVoteElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (lastVoteElementRef.current) {
      observer.current.observe(lastVoteElementRef.current);
    }
  }, [loading, hasMore]);

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white text-lg font-mono font-semibold" style={{ background: 'url("/HearMeBG4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <section className="flex justify-end mt-12 mr-10 ml-10">
          <button className='bg-gray-700 hover:bg-gray-800 mx-auto px-4 py-2 rounded-lg shadow-lg' onClick={toggleSortingOrder}>
            Date {sortingButtonText}
          </button>
          <button className='bg-gray-700 hover:bg-gray-800 mx-auto px-4 py-2 rounded-lg shadow-lg' onClick={toggleTypeShown}>
            Showing: {feedType}
          </button>
        </section>
        <section className='justify-center items-center'>
          <h1 className='text-5xl mt-2 text-center'>Explore</h1>
          <h2 className='text-center text-xl'>All {feedType} Votes:</h2>
          {loading ? (
            <Loading />
          ) : (
            <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <ul>
                {sortedVotes.map((vote, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-700 mx-auto w-3/4 sm:w-2/3 lg:w-1/2 xl:w-1/3 rounded-xl px-4 py-2 m-2" 
                    onClick={() => toggleExpanded(index)}
                    ref={index === sortedVotes.length - 1 ? lastVoteElementRef : null}
                  >
                    <li className='cursor-pointer'>
                      <div className='flex flex-row'>
                        <Image
                          src={vote.image || '/default-userimage.png'}
                          alt='Profile Picture'
                          width={50}
                          height={50}
                          className="rounded-full w-12 h-12"
                          onClick={() => handleUserClick(vote.userId)}
                        />
                        <p className='my-auto ml-4' onClick={() => handleUserClick(vote.userId)}>{vote.name}</p>
                        {isAdmin && (
                          <button 
                            className="hover:bg-red-800 text-white font-bold px-4 py-2 h-1/2 rounded-full ml-auto"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the outer click handler from firing
                              handleDeleteClick(vote.id);
                            }}
                          >
                            x
                          </button>
                        )}
                      </div>

                      <div className="sm:flex sm:flex-row">
                        <div className='mx-auto sm:mx-0 text-center sm:text-center'>
                          <img src={vote.imageUrl} alt={`Cover for ${vote.song}`}
                            className="mx-auto sm:ml-1 text-center my-2 rounded-lg" />
                        </div>
                        <div className='ml-4 text-center sm:text-start my-auto'>
                          <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.song)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=''>
                            <p className='hover:underline'>{vote.song}</p>
                          </a>
                          <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.artist)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=''>
                            <p className='hover:underline text-gray-400'>{vote.artist}</p>
                          </a>
                        </div>
                      </div>
                      {expandedIndex === index && (
                        <>
                          <p className={vote.voteType === '+' ? 'vote-positive' : 'vote-negative'}>Type of vote: {vote.voteType}</p>
                          <p>{formatDate(vote.createdAt)}</p>
                        </>
                      )}
                    </li>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Explore;
