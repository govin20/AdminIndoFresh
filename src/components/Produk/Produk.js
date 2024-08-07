import React, { useState, useEffect } from 'react';
import { Container, Form, InputGroup, Button, Table, Modal, Pagination, Spinner } from 'react-bootstrap';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { MdOutlineAddBusiness } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';

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

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(angka);
};

const unformatRupiah = (formattedString) => {
  return formattedString.replace(/[Rp.,\s]/g, '');
};

function Produk() {
  const [form, setForm] = useState({
    nama: '',
    harga: '',
    jenisHarga: '',
    jenis: '',
    deskripsi: '',
    nutrisi: '',
    gambar: '',
  });

  const [buahData, setBuahData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [dataCount, setDataCount] = useState(0);
  const [imagePreview, setImagePreview] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'harga') {
      const unformattedValue = unformatRupiah(value);
      setForm({ ...form, [id]: unformattedValue });
    } else {
      setForm({ ...form, [id]: value });
    }

    if (id === 'gambar') {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const querySnapshot = await getDocs(collection(db, 'buah'));
      const data = querySnapshot.docs.map((doc) => doc.data());
      const productExists = data.some((buah) => buah.nama.toLowerCase() === form.nama.toLowerCase());

      if (productExists && !editing) {
        alert('Produk yang ditambahkan sudah ada!');
      } else {
        if (editing) {
          const docRef = doc(db, 'buah', currentId);
          await updateDoc(docRef, form);
          setEditing(false);
          setCurrentId(null);
          alert('Data berhasil diperbarui!');
        } else {
          await addDoc(collection(db, 'buah'), form);
          alert('Data berhasil ditambahkan!');
        }
        setForm({
          nama: '',
          harga: '',
          jenisHarga: '',
          jenis: '',
          deskripsi: '',
          nutrisi: '',
          gambar: '',
        });
        setImagePreview('');
        fetchBuahData();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error menambah/memperbarui dokumen: ', error);
      alert('Error menambah/memperbarui data');
    }
  };

  const fetchBuahData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'buah'));
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setBuahData(data);
      setDataCount(data.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents: ', error);
      setLoading(false);
    }
  };

  const handleEdit = (buah) => {
    setForm(buah);
    setImagePreview(buah.gambar);
    setEditing(true);
    setCurrentId(buah.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'buah', id));
      alert('Data berhasil dihapus!');
      fetchBuahData();
    } catch (error) {
      console.error('Error deleting document: ', error);
      alert('Error deleting data');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShowAddModal = () => {
    setForm({
      nama: '',
      harga: '',
      jenisHarga: '',
      jenis: '',
      deskripsi: '',
      nutrisi: '',
      gambar: '',
    });
    setEditing(false);
    setShowModal(true);
  };

  useEffect(() => {
    fetchBuahData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = buahData.filter((buah) => buah.nama.toLowerCase().includes(searchTerm.toLowerCase())).slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(buahData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '90%', position: 'absolute', display: 'flex', height: '80%' }}>
        <Spinner animation="border" role="status"></Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="container">
      <Button className="mb-3" onClick={handleShowAddModal} style={{ backgroundColor: 'lightgreen', border: 'none', color: 'black' }}>
        Tambah Produk <MdOutlineAddBusiness />
      </Button>
      <Form className="mt-1 d-flex">
        <Form.Control placeholder="Cari nama Produk" type="text" id="search" value={searchTerm} onChange={handleSearch} aria-describedby="searchHelpBlock" />
        <div className="d-flex justify-content-center align-items-center ms-2 p-2" style={{ backgroundColor: 'lightblue', borderRadius: 5 }}>
          <BsSearch />
        </div>
      </Form>
      <div className="m-3">
        <h5>Jumlah Produk: {dataCount}</h5>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr className="text-center">
            <th>No</th>
            <th>Nama Produk</th>
            <th>Harga</th>
            <th>Jenis Harga</th>
            <th>Jenis</th>
            <th>Deskripsi</th>
            <th>Nutrisi</th>
            <th>Gambar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((buah, index) => (
            <tr key={buah.id} className="text-center">
              <td>{indexOfFirstItem + index + 1}.</td>
              <td>{buah.nama}</td>
              <td>{formatRupiah(buah.harga)}</td>
              <td>{buah.jenisHarga}</td>
              <td>{buah.jenis}</td>
              <td>{buah.deskripsi}</td>
              <td>{buah.nutrisi}</td>
              <td>
                <img src={buah.gambar} alt={buah.nama} style={{ width: '100px', height: '100px' }} />
              </td>
              <td>
                <Button onClick={() => handleEdit(buah)} style={{ backgroundColor: 'lightblue', border: 'none', color: 'black' }}>
                  Edit
                </Button>{' '}
                <Button onClick={() => handleDelete(buah.id)} className="mt-2" style={{ backgroundColor: 'lightcoral', border: 'none', color: 'black' }}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="mt-3">
        {pageNumbers.map((number) => (
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Produk' : 'Tambah Produk'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Label htmlFor="nama">Nama Produk :</Form.Label>
            <Form.Control required type="text" id="nama" value={form.nama} onChange={handleChange} aria-describedby="passwordHelpBlock" />

            <Form.Label htmlFor="harga">Harga :</Form.Label>
            <Form.Control required type="text" id="harga" value={form.harga} onChange={handleChange} aria-describedby="passwordHelpBlock" />

            <Form.Select required className="mt-3" id="jenisHarga" value={form.jenisHarga} onChange={handleChange} aria-label="Default select example">
              <option value="">Pilih Jenis Harga</option>
              <option value="Kg">Kg</option>
              <option value="Pcs">Pcs</option>
              <option value="Gram">Gram</option>
            </Form.Select>

            <Form.Select required className="mt-3" id="jenis" value={form.jenis} onChange={handleChange} aria-label="Default select example">
              <option value="">Pilih Jenis Produk</option>
              <option value="Buah">Buah</option>
              <option value="Sayur">Sayur</option>
              <option value="Ikan">Ikan</option>
              <option value="BuahKering">Buah Kering</option>
            </Form.Select>

            <Form.Label htmlFor="deskripsi">Deskripsi :</Form.Label>
            <InputGroup>
              <Form.Control required id="deskripsi" as="textarea" value={form.deskripsi} onChange={handleChange} aria-label="With textarea" />
            </InputGroup>

            <Form.Label htmlFor="nutrisi">Nutrisi :</Form.Label>
            <Form.Control required type="number" id="nutrisi" value={form.nutrisi} onChange={handleChange} aria-describedby="passwordHelpBlock" />

            <Form.Label htmlFor="gambar">Link Gambar :</Form.Label>
            <InputGroup>
              <Form.Control required id="gambar" as="textarea" value={form.gambar} onChange={handleChange} aria-label="With textarea" />
            </InputGroup>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" style={{ width: '200px', height: '200px' }} />
              </div>
            )}

            <Button style={{ width: '100%' }} type="submit" className="mt-3 bg-success">
              {editing ? 'Update' : 'Simpan'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Produk;
