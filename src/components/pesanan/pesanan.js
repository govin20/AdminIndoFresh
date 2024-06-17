import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs,updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fungsi untuk mengonversi objek tanggal Firebase ke format string
const convertFirebaseDate = (firebaseDate) => {
  const date = new Date(firebaseDate.seconds * 1000 + firebaseDate.nanoseconds / 1000000);
  return date.toLocaleString();
};

export default function Pesanan() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersSnapshot = await getDocs(collection(db, 'pesanan'));
      const ordersList = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersList);
    };

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'infoUser'));
      const usersList = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});
      setUsers(usersList);
    };

    fetchOrders();
    fetchUsers();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const orderDocRef = doc(db, 'pesanan', orderId);
    await updateDoc(orderDocRef, { status: newStatus });

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Tampilkan alert ketika status berhasil diubah
    alert(`Status pesanan dengan ID ${orderId} berhasil diubah menjadi ${newStatus}`);
  };

  return (
    <Container>
        <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID Pesanan</th>
            <th>ID User</th>
            <th>Waktu</th>
            <th>Pembayaran</th>
            <th>Pengiriman</th>
            <th>Nama</th>
            <th>Harga</th>
            <th>Jumlah</th>
            <th>Total Jumlah</th>
            <th>Total Harga</th>
            <th>Alamat</th>
            <th>No Telp</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
        {orders.map((order) => {
          const user = users[order.userId] || {};
          return (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userId}</td>
              <td>{convertFirebaseDate(order.createdAt)}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.shippingMethod}</td>
              <td>{order.harga}</td>
              <td>{order.nama}</td>
              <td>{order.quantity}</td>
              <td>{order.totalQuantity}</td>
              <td>{order.totalPrice}</td>
              <td>{user.alamat || 'Alamat tidak tersedia'}</td>
              <td>{user.noHp || 'No HP tidak tersedia'}</td>
              <td>{order.status}</td>
              <td>
                <select
                  defaultValue={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="Sedang di proses">Sedang di proses</option>
                  <option value="Sedang di kemas">Sedang di kemas</option>
                  <option value="Dalam perjalanan">Dalam perjalanan</option>
                  <option value="Telah sampai">Telah sampai</option>
                  <option value="Pengiriman gagal">Pengiriman gagal</option>
                  <option value="Pelanggan tidak bisa di hubungi">Pelanggan tidak bisa di hubungi</option>
                </select>
              </td>
            </tr>
          );
        })}
      </tbody> 
      </Table>
      {/* <h1>Pesanan</h1>
      <thead>
        <tr>
          <th>ID Pesanan</th>
          <th>User ID</th>
          <th>Created At</th>
          <th>Payment Method</th>
          <th>Shipping Method</th>
          <th>Harga</th>
          <th>Nama</th>
          <th>Quantity</th>
          <th>Total Quantity</th>
          <th>Total Price</th>
          <th>Status</th>
          <th>Alamat</th>
          <th>No HP</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const user = users[order.userId] || {};
          return (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userId}</td>
              <td>{convertFirebaseDate(order.createdAt)}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.shippingMethod}</td>
              <td>{order.harga}</td>
              <td>{order.nama}</td>
              <td>{order.quantity}</td>
              <td>{order.totalQuantity}</td>
              <td>{order.totalPrice}</td>
              <td>{order.status}</td>
              <td>{user.alamat || 'Alamat tidak tersedia'}</td>
              <td>{user.noHp || 'No HP tidak tersedia'}</td>
              <td>
                <select defaultValue={order.status}>
                  <option value="Sedang di kemas">Sedang di kemas</option>
                  <option value="Dalam perjalanan">Dalam perjalanan</option>
                  <option value="Telah sampai">Telah sampai</option>
                  <option value="Pengiriman gagal">Pengiriman gagal</option>
                  <option value="Pelanggan tidak bisa di hubungi">Pelanggan tidak bisa di hubungi</option>
                </select>
              </td>
            </tr>
          );
        })}
      </tbody> */}
    </Container>
  );
}
