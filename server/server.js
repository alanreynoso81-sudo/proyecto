require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Falta MONGODB_URI en el archivo .env');
  process.exit(1);
}

const loanSchema = new mongoose.Schema(
  {
    student: {
      type: String,
      required: true,
      trim: true
    },
    book: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Prestado', 'Devuelto'],
      default: 'Prestado'
    }
  },
  {
    timestamps: true
  }
);

const Loan = mongoose.model('Loan', loanSchema);
const publicPath = path.join(__dirname, '..', 'PAGINA WEB');

app.disable('x-powered-by');
app.use(express.json());
app.use(express.static(publicPath));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/loans', async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 }).lean();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar los prestamos.' });
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const { student, book, date } = req.body;

    if (!student || !book || !date) {
      return res.status(400).json({ message: 'Completa todos los campos.' });
    }

    const loan = await Loan.create({ student, book, date });
    return res.status(201).json(loan);
  } catch (error) {
    return res.status(400).json({ message: 'Error al guardar el prestamo.' });
  }
});

app.patch('/api/loans/:id/return', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de prestamo invalido.' });
    }

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'Devuelto' },
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({ message: 'No se encontro el prestamo.' });
    }

    return res.json(loan);
  } catch (error) {
    return res.status(400).json({ message: 'Error al actualizar el prestamo.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

mongoose
  .connect(mongoUri, {
    dbName: process.env.MONGODB_DB_NAME || undefined
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor local listo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  });
