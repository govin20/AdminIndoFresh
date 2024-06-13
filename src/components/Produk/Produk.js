import React, { useState, useEffect } from 'react';
import { Container, Form, InputGroup, Button, Table, Modal, Pagination } from 'react-bootstrap';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBlb4PYD9vUP1QdGcOMhRckeL9QFIywuP0',
  authDomain: 'indofresh-fc226.firebaseapp.com',
  projectId: 'indofresh-fc226',
  storageBucket: 'indofresh-fc226.appspot.com',
  messagingSenderId: '504050591085',
  appId: '1:504050591085:web:8770251b68ee48aba5e664',
  measurementId: 'G-679DBB4W89',
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

function App() {
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
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [itemsPerPage] = useState(5); // State for items per page

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
      setDataCount(data.length); // Update the count state
    } catch (error) {
      console.error('Error fetching documents: ', error);
    }
  };

  const handleEdit = (buah) => {
    setForm(buah);
    setImagePreview(buah.gambar); // Set the image preview when editing
    setEditing(true);
    setCurrentId(buah.id);
    setShowModal(true); // Show the modal
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'buah', id));
      alert('Data berhasil dihapus!');
      fetchBuahData(); // Refresh data after deletion
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

  // Logic for displaying current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = buahData.filter((buah) => buah.nama.toLowerCase().includes(searchTerm.toLowerCase())).slice(indexOfFirstItem, indexOfLastItem);

  // Logic for displaying page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(buahData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="container">
      <Button className="mb-3 bg-success" onClick={handleShowAddModal}>
        Tambah Produk
      </Button>
      <Form className="mt-1">
        <Form.Control placeholder="Cari nama Produk" type="text" id="search" value={searchTerm} onChange={handleSearch} aria-describedby="searchHelpBlock" />
      </Form>

      <h2 className="mt-3">Daftar Produk</h2>
      <h4>Total Data Produk: {dataCount}</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
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
            <tr key={buah.id}>
              <td>{indexOfFirstItem + index + 1}</td>
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
                <Button variant="warning" onClick={() => handleEdit(buah)}>
                  Edit
                </Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(buah.id)}>
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
            <Form.Control type="text" id="nama" value={form.nama} onChange={handleChange} aria-describedby="passwordHelpBlock" />

            <Form.Label htmlFor="harga">Harga :</Form.Label>
            <Form.Control
              type="text"
              id="harga"
              value={formatRupiah(form.harga)}
              onChange={handleChange}
              aria-describedby="passwordHelpBlock"
            />

            <Form.Select className="mt-3" id="jenisHarga" value={form.jenisHarga} onChange={handleChange} aria-label="Default select example">
              <option value="">Pilih Jenis Harga</option>
              <option value="Kg">Kg</option>
              <option value="Pcs">Pcs</option>
              <option value="Gram">Gram</option>
            </Form.Select>

            <Form.Select className="mt-3" id="jenis" value={form.jenis} onChange={handleChange} aria-label="Default select example">
              <option value="">Pilih Jenis Produk</option>
              <option value="Buah">Buah</option>
              <option value="Sayur">Sayur</option>
              <option value="Ikan">Ikan</option>
              <option value="BuahKering">Buah Kering</option>
            </Form.Select>

            <Form.Label htmlFor="deskripsi">Deskripsi :</Form.Label>
            <InputGroup>
              <Form.Control id="deskripsi" as="textarea" value={form.deskripsi} onChange={handleChange} aria-label="With textarea" />
            </InputGroup>

            <Form.Label htmlFor="nutrisi">Nutrisi :</Form.Label>
            <Form.Control type="number" id="nutrisi" value={form.nutrisi} onChange={handleChange} aria-describedby="passwordHelpBlock" />

            <Form.Label htmlFor="gambar">Link Gambar :</Form.Label>
            <InputGroup>
              <Form.Control id="gambar" as="textarea" value={form.gambar} onChange={handleChange} aria-label="With textarea" />
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

export default App;
