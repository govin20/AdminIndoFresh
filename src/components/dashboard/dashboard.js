import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import moment from 'moment';
import 'chart.js/auto';
import { AiOutlineProduct } from "react-icons/ai";
import { BsCartCheck,BsPeople   } from "react-icons/bs";
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
  const [userCount, setUserCount] = useState(0);
  const [ordersPerMonth, setOrdersPerMonth] = useState({});
  const [ordersByStatus, setOrdersByStatus] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pesanan'));
        const orders = querySnapshot.docs.map((doc) => doc.data());
        setOrderCount(orders.length);
    
        // Mapping of English month names to shortened Indonesian month names
        const monthMapping = {
          'January': 'Jan',
          'February': 'Feb',
          'March': 'Mar',
          'April': 'Apr',
          'May': 'Mei',
          'June': 'Jun',
          'July': 'Jul',
          'August': 'Agu',
          'September': 'Sep',
          'October': 'Okt',
          'November': 'Nov',
          'December': 'Des'
        };
    
        const ordersByMonth = orders.reduce((acc, order) => {
          const date = order.createdAt;
          if (date) {
            const month = moment(date.toDate()).format('MMMM');
            const shortMonth = monthMapping[month] || 'Invalid date';
            if (shortMonth !== 'Invalid date') {
              acc[shortMonth] = acc[shortMonth] ? acc[shortMonth] + 1 : 1;
            }
          }
          return acc;
        }, {});
    
        const allMonths = Object.values(monthMapping);
        const completeOrdersByMonth = allMonths.reduce((acc, month) => {
          acc[month] = ordersByMonth[month] || 0;
          return acc;
        }, {});
        setOrdersPerMonth(completeOrdersByMonth);
    
        const statusCount = orders.reduce((acc, order) => {
          const status = order.status;
          acc[status] = acc[status] ? acc[status] + 1 : 1;
          return acc;
        }, {});
        setOrdersByStatus(statusCount);
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
        const user = querySnapshot.docs.map((doc) => doc.data());
        setUserCount(user.length);
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
        data: [produkCount, orderCount, userCount],
        backgroundColor: ['#36A2EB', '#FF6384', '#42f554'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#42f554'],
      },
    ],
  };

  const barData = {
    maintainAspectRatio: false,
    labels: Object.keys(ordersPerMonth),
    datasets: [
      {
        label: 'Pesanan',
        data: Object.values(ordersPerMonth),
        backgroundColor: '#aa42f5',
      },
    ],
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10,
          },
        },
      },
    },
  };

  const barStatusData = {
    type: 'bar',
    labels: [
      'Sedang di proses',
      'Sedang di kemas',
      'Dalam perjalanan',
      'Telah sampai',
      'Pengiriman gagal',
      'Pelanggan tidak bisa di hubungi',
    ],
    datasets: [
      {
        label: 'Status Pesanan',
        data: [
          ordersByStatus['Sedang di proses'] || 0,
          ordersByStatus['Sedang di kemas'] || 0,
          ordersByStatus['Dalam perjalanan'] || 0,
          ordersByStatus['Telah sampai'] || 0,
          ordersByStatus['Pengiriman gagal'] || 0,
          ordersByStatus['Pelanggan tidak bisa di hubungi'] || 0,
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(89, 255, 132, 0.2)',
          'rgba(245, 56, 69, 0.2)',
          'rgba(235, 80, 201, 0.2)',
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(89, 255, 132)',
          'rgb(245, 56, 69)',
          'rgb(235, 80, 201)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          // max: 50,
        },
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
  };

  return (
    <Container>
      <Row className="mt-3">
        <Col md={6}>
          <Card>
            <Card.Body className="d-flex justify-content-between">
              <div className=' text-center p-2' style={{backgroundColor:'lightblue',borderRadius:5,width:'25%'}}>
              <AiOutlineProduct size={40}/>
                <Card.Title><h6>Produk</h6></Card.Title>
                <CountUp start={0} end={produkCount} duration={3} separator="," />
              </div>
              <div className=' text-center p-2' style={{backgroundColor:'lightblue',borderRadius:5,width:'25%'}}>
              <BsCartCheck />
                <Card.Title>Pesanan</Card.Title>
                <CountUp start={0} end={orderCount} duration={2} separator="," />
              </div>
              <div className=' text-center p-2' style={{backgroundColor:'lightblue',borderRadius:5,width:'25%'}}>
              <BsPeople />
                <Card.Title>Pelanggan</Card.Title>
                <CountUp start={0} end={userCount} duration={2} separator="," />
              </div>
            </Card.Body>
          </Card>
          <Card className="mt-2 mb-3">
            <Card.Body>
              <Card.Title>Distribusi Produk, Pesanan, Pelanggan</Card.Title>
              <div style={{ height: '300px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <Pie data={pieData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Jumlah pesanan per bulan</Card.Title>
              <div style={{ height: '400px', width: '100%' }}>
                <Bar data={barData} options={barStatusOptions}/>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mt-2 mb-3">
        <Card.Body>
          <Card.Title>Status pesanan</Card.Title>
          <div style={{ height: '400px', width: '100%' }}>
            <Bar data={barStatusData} options={barStatusOptions} />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
