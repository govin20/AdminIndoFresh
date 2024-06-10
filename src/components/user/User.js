import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function User() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ name: currentUser.displayName, email: currentUser.email });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Container>
      <h1>User</h1>
      {user ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <p>Tidak ada pengguna yang masuk</p>
      )}
    </Container>
  );
}
