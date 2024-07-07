import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Pagination, Spinner, Form,Dropdown } from 'react-bootstrap';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

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

const convertFirebaseDate = (firebaseDate) => {
  const date = new Date(firebaseDate.seconds * 1000 + firebaseDate.nanoseconds / 1000000);
  return date.toLocaleString();
};

export default function Pesanan() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState(['Sedang di proses']);
  const statuses = [
    'Sedang di proses',
    'Sedang di kemas',
    'Dalam perjalanan',
    'Telah sampai',
    'Pengiriman gagal',
    'Pelanggan tidak bisa di hubungi',
  ];

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

    const fetchData = async () => {
      await fetchOrders();
      await fetchUsers();
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const orderDocRef = doc(db, 'pesanan', orderId);
    await updateDoc(orderDocRef, { status: newStatus });

    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));

    alert(`Status pesanan dengan ID ${orderId} berhasil diubah menjadi ${newStatus}`);
  };

  const handleDeleteOrder = async (orderId) => {
    const orderDocRef = doc(db, 'pesanan', orderId);
    await deleteDoc(orderDocRef);

    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));

    alert(`Pesanan dengan ID ${orderId} berhasil dihapus`);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(angka);
  };

  const handleCheckboxChange = (status) => {
    setSelectedStatuses((prevStatuses) =>
      prevStatuses.includes(status) ? prevStatuses.filter((s) => s !== status) : [...prevStatuses, status]
    );
  };

  if (loading) {
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '90%', position: 'absolute', display: 'flex', height: '80%' }}>
        <Spinner animation="border" role="status"></Spinner>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => selectedStatuses.includes(order.status));

  // Sort the filtered orders to prioritize "Sedang di proses"
  if (selectedStatuses.length === statuses.length) {
    filteredOrders.sort((a, b) => {
      if (a.status === 'Sedang di proses' && b.status !== 'Sedang di proses') return -1;
      if (a.status !== 'Sedang di proses' && b.status === 'Sedang di proses') return 1;
      return 0;
    });
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleCheckboxChangeInternal = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };
  
  const handleItemClick = (status) => {
    handleCheckboxChangeInternal(status);
  };

  return (
    <Container className="mt-2 w-100 mx-auto">
      <Dropdown className='mb-3 mt-3'>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Pilih Status
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item as="div">
          <Form.Check
            type="checkbox"
            label="Tampilkan Semua"
            checked={selectedStatuses.length === statuses.length}
            onChange={() =>
              setSelectedStatuses(selectedStatuses.length === statuses.length ? [] : [...statuses])
            }
          />
        </Dropdown.Item>
        {statuses.map((status) => (
          <Dropdown.Item as="div" key={status} onClick={() => handleItemClick(status)}>
            <Form.Check
              type="checkbox"
              label={status}
              checked={selectedStatuses.includes(status)}
              onChange={() => handleCheckboxChange(status)}
              onClick={(e) => e.stopPropagation()} // This ensures the checkbox itself doesn't capture the click
            />
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
      <Table striped bordered hover responsive className="table-sm">
        <thead className="thead-dark">
          <tr className="text-center">
            <th>ID Pesanan</th>
            <th>Waktu</th>
            <th>Pembayaran</th>
            <th>Jumlah</th>
            <th>Total Harga</th>
            <th>Alamat</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => {
            const user = users[order.userId] || {};
            return order.cartItems.map((item, index) => (
              <tr key={index} className="text-center">
                {index === 0 && (
                  <>
                    <td>{order.id}</td>
                    <td>{convertFirebaseDate(order.createdAt)}</td>
                    <td>{order.paymentMethod}</td>
                    <td>{order.totalQuantity}</td>
                    <td>{formatRupiah(order.totalPrice)}</td>
                    <td>{`${user.provinsi}, ${user.kota}, ${user.kecamatan}, ${user.kelurahan}, ${user.details} `}</td>
                    <td>{order.status}</td>
                    <td>
                      <div>
                        <select defaultValue={order.status} className="form-select" onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <Button className="mt-1" onClick={() => handleDeleteOrder(order.id)} style={{ backgroundColor: 'lightcoral', border: 'none', color: 'black' }}>
                          Hapus
                        </Button>
                        <Button className="mt-1" as={Link} to={`/detail_pesanan/${order.id}`} style={{ backgroundColor: 'lightblue', border: 'none', color: 'black' }}>
                          Detail
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ));
          })}
        </tbody>
      </Table>
      <Pagination>
        <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
      </Pagination>
    </Container>
  );
}
