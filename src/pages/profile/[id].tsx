import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HamburgerMenu from "../components/HamburgerMenu";
import Image from 'next/image';
import Loading from "../components/Loading";

type VoteDetails = {
    date: Date | string;
    song: string;
    artist: string;
    imageUrl: string;
};

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState<any>(null);
  const [lastVoteDetails, setLastVoteDetails] = useState<VoteDetails | null>(null);
  const [firstVote, setFirstVote] = useState<string | null>(null);
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

    const fetchFirstVote = async () => {
        try {
          const response = await fetch('/api/getMyFirstVote?first=true');
          if (!response.ok) throw new Error('Failed to fetch the first vote');
          const vote = await response.json();
          setFirstVote(`${new Date(vote.createdAt).toLocaleDateString()}`);
        } catch (error) {
          console.error('Error fetching the first vote:', error);
        }
      };

    if (id) {
      fetchUserData();
      fetchUserVotes();
      fetchFirstVote();
    }
  }, [id]);

  if (!userData) return <Loading />;

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white items-center justify-center text-lg font-mono font-semibold" style={{ background: 'url("/cssBackground4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <section>
          <div>
            <h1 className='text-center my-3 underline'>{userData.name}</h1>
            <div>
              <Image
                className="rounded-full w-24 h-24 border border-white"
                src={userData.image ?? '/default-userimage.png'}
                alt={"pfp of user" + userData.name}
                width={250}
                height={250} 
              />
            </div>
          </div>
        </section>
        <div className="grid lg:gap-x-28 xl:gap-x-48 my-5 mx-5 grid-cols-1 lg:grid-cols-3">
          <div>
            {userData.favoriteArtist ? (
              <div>
                <h2 className='text-center'>Favourite Artist:</h2>
                <div className="bg-gray-700 rounded-2xl p-3 flex items-center">
                  <img
                    src={userData.favArtImg || 'default-image-url'}
                    alt={`Image for ${userData.favoriteArtist}`}
                    className="artist-image w-16 ml-2 rounded-lg "
                  />
                  <div className="ml-2 ">
                    <strong>{userData.favoriteArtist}</strong>
                  </div>
                </div>
              </div>
            ) : (
              'Favorite Artist'
            )}
          </div>
          <div className="rounded-md py-1 text-center mt-2">
            <span className='bg-gray-700 px-4 py-2 rounded-lg'>Votes: {voteCount}</span>
            {firstVote && (
            <h1 className='bg-gray-700 px-4 py-2 rounded-lg mt-2 text-center'>First Vote - {firstVote}</h1>
        )}
          </div>
          <div className="rounded-md py-1 text-center cursor-pointer my-auto">
            <div>
              {userData.favoriteAlbum ? (
                <div>
                  <h2 className='text-center'>Favourite Album:</h2>
                  <div className="bg-gray-700 rounded-2xl p-3 flex items-center">
                    <img
                      src={userData.favAlbImg || 'default-image-url'}
                      alt={`Image for ${userData.favoriteAlbum}`}
                      className="album-image w-16 ml-2 rounded-lg "
                    />
                    <div className="ml-2">
                      <strong>{userData.favoriteAlbum}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                'Favorite Album'
              )}
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
