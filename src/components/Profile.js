import React, { useContext, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from './AuthContext';
import Loading from './Loading';
import Error from './Error';
import { useAuth } from './AuthContext';

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

const ProfileContainer = styled.div`
  max-width: 400px;
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

const ProfileTitle = styled.h2`
  margin-bottom: 1rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
`;

const Profile = () => {
  const {loading, error } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const { user, logout } = useAuth();
  const token = user?.token;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
  
    try {
      await axios.put('https://eventtimerdb.herokuapp.com/profile/me/', { name, email }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update the user context or refetch user data
      setUpdateLoading(false);
    } catch (error) {
      setUpdateError('Failed to update profile');
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
  
    if (newPassword !== confirmNewPassword) {
      setUpdateError('New passwords do not match');
      setUpdateLoading(false);
      return;
    }
  
    try {
      await axios.put('https://eventtimerdb.herokuapp.com/profile/change_password/', { current_password: currentPassword, new_password: newPassword }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUpdateLoading(false);
      // Clear form fields and display a success message
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      alert('Password changed successfully');
    } catch (error) {
      setUpdateError('Failed to change password');
      setUpdateLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        await axios.delete('https://eventtimerdb.herokuapp.com/profile/delete_profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        logout();
        // Redirect to the home page or display a success message
      } catch (error) {
        setUpdateError('Failed to delete profile');
      }
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
      <ProfileContainer>
        <ProfileTitle>Profile</ProfileTitle>
        {updateError && <Error message={updateError} />}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Name:</FormLabel>
            <FormInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Email:</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={updateLoading}>
            {updateLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>

        <form onSubmit={handlePasswordChange}>
          <FormGroup>
            <FormLabel>Current Password:</FormLabel>
            <FormInput
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>New Password:</FormLabel>
            <FormInput
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Confirm New Password:</FormLabel>
            <FormInput
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={updateLoading}>
            {updateLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>

        <Button onClick={handleDeleteProfile}>Delete Profile</Button>
      </ProfileContainer>
    </PageContainer>
  );
};

export default Profile;