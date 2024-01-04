// Profile component
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import HamburgerMenu from "./components/HamburgerMenu";

const Profile: React.FC = () => {
  const router = useRouter();
  const { selectedSong } = router.query;
  const { data: sessionData } = useSession();

  const getArtistsNames = (track: any): string => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map((artist: any) => artist.name).join(', ');
    } else {
      return 'Unknown Artist';
    }
  };

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white bg-black items-center justify-center text-lg  font-mono font-semibold">
        <Link href="/" className="absolute right-10 top-5">
          back
        </Link>
        <section>
          <div>
            <h1 className='text-center my-3'>Dejny</h1>
            <AuthShowcase />
          </div>
        </section>
        <div className="grid gap-x-60 my-5 grid-cols-3">
          <div>Favourite Artist</div>
          <div><span>Votes</span> - <span>Registered Date</span></div>
          <div>Favourite Album</div>
        </div>
        <div className=" w-3/12 h-12 bg-stone-50 rounded-full my-5">
          <h1 className='text-black mt-2 text-center'>Today's Vote</h1>
        </div>

        {/* Display selected song */}
        {selectedSong && (
          <div className="my-2 border-white border rounded-md p-4">
            {/* Use JSON.parse to convert the string to an object */}
            <img
              src={JSON.parse(selectedSong as string).album.images[2]?.url || 'default-image-url'}
              alt={`Album cover for ${JSON.parse(selectedSong as string).name}`}
              className='song-image'
            />
            <div>
              <strong>{JSON.parse(selectedSong as string).name}</strong>
              <br />
              <span className='text-gray-400'>{getArtistsNames(JSON.parse(selectedSong as string))}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white"></p>
      {sessionData && 
      <div>
        <Image
          className="rounded-full w-24 h-24 shadow-white shadow-md"
          src={sessionData.user?.image ?? ""}
          alt={"pfp of user" + sessionData.user?.name}
          width={250}
          height={250} 
        />
      </div>
      }
    </div>
  );
}

export default Profile;
