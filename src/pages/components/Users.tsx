import { GetStaticProps } from 'next';
import { db } from 'lib/prisma';
import { User } from '@prisma/client';

interface UsersPageProps {
  userList: User[]; // Change the prop name to userList
}

const UsersPage: React.FC<UsersPageProps> = ({ userList }) => { // Update the prop name here as well
    return (
      <div>
        <h1>User List</h1>
        <ul>
          {userList.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  };
  
export default UsersPage;
