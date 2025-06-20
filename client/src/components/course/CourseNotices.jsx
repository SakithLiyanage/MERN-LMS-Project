import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import NoticeItem from './NoticeItem';

const CourseNotices = () => {
  const { id } = useParams();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        // Make sure to include courseId as a query parameter
        const response = await axios.get(`/api/notices?courseId=${id}`);
        console.log('Fetched notices:', response.data);
        setNotices(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notices:', err);
        setError('Failed to load notices');
        setLoading(false);
      }
    };

    if (id) {
      fetchNotices();
    }
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (notices.length === 0) {
    return <Typography variant="body1">No notices available for this course.</Typography>;
  }

  return (
    <Box>
      {notices.map((notice) => (
        <NoticeItem key={notice._id} notice={notice} />
      ))}
    </Box>
  );
};

export default CourseNotices;
