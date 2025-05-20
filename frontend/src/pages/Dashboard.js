import React, { useEffect, useState } from 'react';
import Editor from "@monaco-editor/react";

// import { getDashboardData } from '../api/auth';

function Dashboard() {
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
      <Editor
        height="500px"
        defaultLanguage="plaintext"
        value={fileContent}
      />

    </div>
  );
}

export default Dashboard;
