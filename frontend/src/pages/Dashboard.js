import React, { useEffect, useState } from 'react';
// import { getDashboardData } from '../api/auth';

function Dashboard() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const data = await getDashboardData(token);
    //     setMessage(data.message);
    //   } catch (error) {
    //     setMessage(error.message);
    //   }
    // };

    // fetchData();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>{message}</p>
    </div>
  );
}

export default Dashboard;
