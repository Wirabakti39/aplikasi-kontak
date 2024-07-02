const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();

// Middleware untuk melayani file statis
app.use(express.static('public'));

// Middleware untuk body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware untuk method override
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

// Koneksi ke MongoDB
mongoose.connect('mongodb://localhost:27017/nodejs', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Model
const contacts = mongoose.model('contacts', new mongoose.Schema({
    name: String,
    email: String,
    number: String
}));

// Rute untuk halaman utama
app.get('/', async (req, res) => {
    try {
        const contactList = await contacts.find();
        res.render('index', {
            titlePage: "DwB Contacts App",
            contactList,
        });
      } catch (err) {
        res.status(500).send(err);
      }
});

// Rute untuk melihat detail kontak berdasarkan ID
app.get('/contact/:id', async (req, res) => {
    try {
      const contact = await contacts.findById(req.params.id);
      res.render('contact', {
        titlePage: contact.name,
        contact
      });
    } catch (err) {
      res.status(500).send(err);
    }
});

// rute untuk halaman tambah kontak
app.get('/addContact', (req, res) => {
  try {
    res.render('addContact', {
      titlePage: "Tambah Kontak"
    })
  } catch (err) {
    res.status(500).send(err);
  }
})
// post method untuk tambah kontak
app.post('/addContact', async (req, res) => {
  const { number, name, email } = req.body;
  const newContact = new contacts({ name, email, number });
  try {
      await newContact.save();
      res.redirect('/');
  } catch (err) {
      res.status(500).send(err);
  }
});

// delete method
app.delete('/delete/:id', async (req, res) => {
  try {
    await contacts.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err);
  }
});

// rute untuk halaman edit
app.get('/edit/:id', async (req, res) => {
  const contact = await contacts.findById(req.params.id);
  try {
    res.render('editContact', {
      titlePage: `Edit | ${contact.name}`,
      contact
    })
  } catch (err) {
    res.status(500).send(err);
  }
})

// edit method
app.put('/edit/:id', async (req, res) => {
  const { name, email, number } = req.body;
  try {
      await contacts.findByIdAndUpdate(req.params.id, { name, email, number });
      res.redirect(`/contact/${req.params.id}`);
  } catch (err) {
      res.status(500).send(err);
  }
});

// Search kontak berdasarkan nama
app.get('/search', async (req, res) => {
  const searchQuery = req.query.q;
  try {
      const contactList = await contacts.find({ name: new RegExp(searchQuery, 'i') });
      res.render('index', {
        titlePage: "DwB Contacts App",
        contactList
      });
  } catch (err) {
      res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
