// index.tsx

import React, { useState } from 'react';
import { NajdiUsery } from "~/actions/users";


const Usersnajdi: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  const handleButtonClick = async () => {
    try {
      const usersData = await NajdiUsery();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      <button onClick={handleButtonClick}>Fetch Users</button>
    </div>
  );
};

export default Usersnajdi;
