import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from './AuthContext';
import Loading from './Loading';
import Error from './Error';
import EditEventModal from './EditEventModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { format } from 'date-fns';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Ojuju', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const EventListContainer = styled.div`
  flex: 1;
  max-width: 800px;
  margin: auto;
  padding: 2rem;
  border: 5px solid #000;
  border-radius: 10px;
  background-color: #fff;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 1rem;
  }
`;

const EventListHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  padding: 1rem;
  font-weight: bold;
  border-bottom: 2px solid #000;
  margin-bottom: 1rem;
  font-family: 'Ojuju', sans-serif;
`;

const EventListItem = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
  font-family: 'Ojuju', sans-serif;
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Ojuju', sans-serif;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #007bff;
`;

const EventList = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      eventCategory: 'Meeting',
      createdAt: '2023-06-10T10:00:00',
      duration: 3600,
      details: 'Project discussion with team',
    },
    {
      id: 2,
      eventCategory: 'Phone Call',
      createdAt: '2023-06-11T14:30:00',
      duration: 1800,
      details: 'Client follow-up call',
    },
    {
      id: 3,
      eventCategory: 'Video Call',
      createdAt: '2023-06-12T16:45:00',
      duration: 2700,
      details: 'Remote interview with candidate',
    },
  ]);
  // const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  // const [hasMore, setHasMore] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`/api/events?page=${page}&search=${searchTerm}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setEvents((prevEvents) => [...prevEvents, ...response.data]);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, page, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setEvents([]);
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedEvent(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedEvent(null);
    setIsDeleteModalOpen(false);
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
    closeEditModal();
  };

  const handleEventDelete = async () => {
    try {
      await axios.delete(`/api/events/${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEvent.id));
      closeDeleteModal();
    } catch (error) {
      setError('Failed to delete event');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <PageContainer>
      <EventListContainer>
        <h2>Event List</h2>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by type or date"
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
        <EventListHeader>
          <div>Event Type</div>
          <div>Date</div>
          <div>Duration</div>
          <div>Event Notes</div>
          <div>Edit</div>
          <div>Delete</div>
        </EventListHeader>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <EventListItem key={event.id}>
              <div>{event.eventCategory}</div>
              <div>{format(new Date(event.createdAt), 'yyyy-MM-dd HH:mm')}</div>
              <div>{Math.floor(event.duration / 60)} minutes</div>
              <div>{event.details}</div>
              <div>
                <IconButton onClick={() => openEditModal(event)}>✏️</IconButton>
              </div>
              <div>
                <IconButton onClick={() => openDeleteModal(event)}>🗑️</IconButton>
              </div>
            </EventListItem>
          ))
        )}
        {loading && <Loading />}
      </EventListContainer>
      {isEditModalOpen && (
        <EditEventModal
          event={selectedEvent}
          onClose={closeEditModal}
          onEventUpdate={handleEventUpdate}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onConfirm={handleEventDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </PageContainer>
  );
};

export default EventList;