import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Card, Container, Row, Col, Table, Spinner } from 'react-bootstrap';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const DetailPesanan = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'pesanan'));
        const orders = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const currentOrder = orders.find((o) => o.id === orderId);
        setOrder(currentOrder);

        if (currentOrder) {
          const usersSnapshot = await getDocs(collection(db, 'infoUser'));
          const users = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const currentUser = users.find((u) => u.id === currentOrder.userId);
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '90%', position: 'absolute', display: 'flex', height: '80%' }}>
        <Spinner animation="border" role="status"></Spinner>
        <span style={{ marginLeft: '10px' }}>Loading...</span>
      </div>
    );
  }

  if (!order || !user) {
    return <div>Data tidak ditemukan.</div>;
  }

  const convertFirebaseDate = (firebaseDate) => {
    const date = new Date(firebaseDate.seconds * 1000 + firebaseDate.nanoseconds / 1000000);
    return date.toLocaleString();
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(angka);
  };

  return (
    <Container>
      <Card className="mt-4 mb-4">
        <Card.Header>
          <h2>Detail Pesanan</h2>
          <p>
            <strong>Nama Pengguna: </strong>
            {currentUser?.displayName}
          </p>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4>Informasi Pesanan</h4>
              <p>
                <strong>ID Pesanan:</strong> {order.id}
              </p>
              <p>
                <strong>Tanggal: </strong>
                {convertFirebaseDate(order.createdAt)}
              </p>
              <p>
                <strong>Metode Pembayaran: </strong> {order.paymentMethod}
              </p>
              <p>
                <strong>Metode Pengiriman: </strong> {order.shippingMethod}
              </p>
              <p>
                <strong>Total Jumlah: </strong> {order.totalQuantity}
              </p>
              <p>
                <strong>Total Harga: </strong>
                {formatRupiah(order.totalPrice)}
              </p>
              <p>
                <strong>Status: </strong> {order.status}
              </p>
            </Col>
            <Col md={6}>
              <h4>Detail Pengguna</h4>
              <p>
                <strong>ID Pelanggan:</strong> {order.userId}
              </p>
              <p>
                <strong>Nama: </strong> {currentUser?.displayName}
              </p>
              <p>
                <strong>Alamat: </strong> {`${user.kecamatan}, ${user.kota}, ${user.provinsi}, ${user.negara}`}
              </p>
              <p>
                <strong>Detail Alamat: </strong> {user.details}
              </p>
              <p>
                <strong>No HP: </strong> {user.nohp}
              </p>
            </Col>
          </Row>
          <h4 className="mt-4">Barang Pesanan</h4>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Harga</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {order.cartItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.nama}</td>
                  <td>{formatRupiah(item.harga)}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DetailPesanan;
