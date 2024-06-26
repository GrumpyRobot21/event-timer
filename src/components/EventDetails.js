import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import Loading from './Loading';
import Error from './Error';
import { useAuth } from './AuthContext';
import api from './api';

const StyledEventDetails = styled.div`
  margin: 20px;
`;

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/api/events/${id}/`);
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch event details');
        setLoading(false);
      }
    };

    if (user && user.token) {
      fetchEvent();
    }
  }, [id, user]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <StyledEventDetails>
      <h2>{event.eventCategory}</h2>
      <p>Duration: {event.duration} seconds</p>
      <p>Details: {event.details}</p>
    </StyledEventDetails>
  );
};

export default EventDetails;