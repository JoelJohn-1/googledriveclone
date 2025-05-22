import React, { useEffect, useState } from 'react';
import { getDocuments, createDocument } from '../api/documents';
import {
  List,
  Pagination,
  Divider,
  Paper,
  Typography,
  Box,
  Button
} from '@mui/material';
import DocumentListItem from '../components/DocumentListItem'; // new component

function Dashboard() {
  const pageLimit = 7;
  const [documents, setDocuments] = useState([]); // store list of strings
  const [pageNum, setPageNum] = useState(0);

  const createUserDocument = async() => {
    try {
      const data = await createDocument("Untitled Document");
      getUserDocuments();
    } catch (error) {
      console.error(error);
    }
  }
  const getUserDocuments = async (page = 0) => {
    try {
      const data = await getDocuments(page, pageLimit);
      setPageNum(Math.ceil(data.Total / pageLimit));
      setDocuments(data.Documents || []);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getUserDocuments(pageNum);
  }, []);

  return (
    <Box>
      <Box width="100%" display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" gutterBottom>
          Your Documents
        </Typography>
        <Button onClick={createUserDocument} variant="contained">+</Button>
      </Box>
      <Paper elevation={2}>
        <List>
          {documents.map((doc, idx) => (
            <React.Fragment key={doc._id}>
              <DocumentListItem doc={doc} />
              {idx < documents.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Box
        position="fixed"
        bottom={20}
        right={20}
        zIndex={1000}
      >
        <Pagination
          count={pageNum}
          onChange={(event, value) => getUserDocuments(value - 1)}
          color="primary"
        />
      </Box>
    </Box>

  );
}

export default Dashboard;
