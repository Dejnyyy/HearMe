// pages/profile/[id].tsx
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import HamburgerMenu from "../components/HamburgerMenu";
import FaveArtist from "../components/FaveArtist";
import FaveAlbum from "../components/FaveAlbum";
import Image from 'next/image';

type LastVoteDetails = {
  date: Date | string;
  song: string;
  artist: string;
  imageUrl: string | null;
} | null;

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: sessionData } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [lastVoteDetails, setLastVoteDetails] = useState<LastVoteDetails>(null);
  const [voteCount, setVoteCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${id}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserVotes = async () => {
      try {
        const response = await fetch(`/api/getUserVotes?userId=${id}`);
        const votes = await response.json();
        setVoteCount(votes.length);
        if (votes.length > 0) {
          const lastVote = votes[votes.length - 1];
          setLastVoteDetails({
            date: new Date(lastVote.createdAt).toLocaleDateString(),
            song: lastVote.song,
            artist: lastVote.artist,
            imageUrl: lastVote.imageUrl ?? 'path/to/default-image.png',
          });
        }
      } catch (error) {
        console.error('Error fetching user votes:', error);
      }
    };

    if (id) {
      fetchUserData();
      fetchUserVotes();
    }
  }, [id]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white items-center justify-center text-lg font-mono font-semibold" style={{ background: 'url("/cssBackground4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <section>
          <div>
            <h1 className='text-center my-3 underline'>{userData.name}</h1>
          </div>
        </section>
        <div className="grid lg:gap-x-28 xl:gap-x-48 my-5 mx-5 grid-cols-1 lg:grid-cols-3">
          <div>
            <FaveArtist favoriteArtist={userData.favoriteArtist} />
          </div>
          <div className="rounded-md py-1 text-center mt-2">
            <span className='bg-gray-700 px-4 py-2 rounded-lg'>Votes: {voteCount}</span>
          </div>
          <div className="rounded-md py-1 text-center cursor-pointer my-auto">
            <div>
              <FaveAlbum favoriteAlbum={userData.favoriteAlbum} />
            </div>
          </div>
        </div>
        <div className="w-3/4 sm:w-2/3 md:w-1/2 lg:w-3/12 h-12 bg-stone-50 rounded-full my-5">
          <h1 className='text-black mt-2 text-center'>Last Vote - {lastVoteDetails ? lastVoteDetails.date : 'No votes yet'}</h1>
        </div>

        {lastVoteDetails && (
          <div className="bg-gray-700 rounded-2xl p-3 flex items-center mb-20">
            <img
              src={lastVoteDetails.imageUrl}
              alt={'No voted songs yet'}
              className="artist-image w-16 h-auto ml-2 rounded-xl"
            />
            <div className='mx-2'>
              <a href={`https://open.spotify.com/search/${encodeURIComponent(lastVoteDetails.song)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className='text-start '>
                  <p className='text-start hover:underline'>{lastVoteDetails.song}</p>
              </a>  
              <span className='text-gray-400 w-auto'>{lastVoteDetails.artist}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
