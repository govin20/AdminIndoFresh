import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import moment from 'moment';
import 'chart.js/auto';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);
const db = getFirestore();

const Dashboard = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [produkCount, setProdukCount] = useState(0);
  const [UserCount, setUserCount] = useState(0);
  const [ordersPerMonth, setOrdersPerMonth] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pesanan'));
        const orders = querySnapshot.docs.map((doc) => doc.data());
        console.log('Orders:', orders); // Add this line for debugging
        setOrderCount(orders.length);

        const ordersByMonth = orders.reduce((acc, order) => {
          const date = order.createdAt;
          if (date) {
            const month = moment(date.toDate()).format('MMMM');
            if (month !== 'Invalid date') {
              acc[month] = acc[month] ? acc[month] + 1 : 1;
            }
          }
          return acc;
        }, {});
        setOrdersPerMonth(ordersByMonth);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'buah'));
        const produk = querySnapshot.docs.map((doc) => doc.data());
        setProdukCount(produk.length);
      } catch (error) {
        console.error('Error fetching produk:', error);
      }
    };

    fetchProduk();
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'infoUser'));
        const User = querySnapshot.docs.map((doc) => doc.data());
        setUserCount(User.length);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const pieData = {
    labels: ['Total Produk', 'Total Pesanan', 'Total User'],
    datasets: [
      {
        data: [produkCount, orderCount, UserCount],
        backgroundColor: ['#36A2EB', '#FF6384', '#42f554'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#42f554'],
      },
    ],
  };

  const barData = {
    labels: Object.keys(ordersPerMonth),
    datasets: [
      {
        label: 'Pesanan',
        data: Object.values(ordersPerMonth),
        backgroundColor: '#36A2EB',
      },
    ],
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  };

  return (
    <Container>
      <Row className="mt-3">
        <Col md={6}>
          <Card>
            <Card.Body className="d-flex justify-content-between">
              <div>
                <Card.Title>Total Produk</Card.Title>
                <CountUp start={0} end={produkCount} duration={1} separator="," />
              </div>
              <div>
                <Card.Title>Total Pesanan</Card.Title>
                <CountUp start={0} end={orderCount} duration={1} separator="," />
              </div>
              <div>
                <Card.Title>Total user</Card.Title>
                <CountUp start={0} end={UserCount} duration={1} separator="," />
              </div>
            </Card.Body>
          </Card>
          <Card className="mt-2 mb-3">
            <Card.Body>
              <Card.Title>Distribusi Produk, Pesanan, User</Card.Title>
              <div style={{ height: '300px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <Pie data={pieData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Jumlah Pesanan per Bulan</Card.Title>
              <div style={{ height: '400px' }}>
                <Bar data={barData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
