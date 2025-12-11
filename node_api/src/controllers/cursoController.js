const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Adicionado para remover arquivos físicos
const Curso = require('../models/Curso'); // Importar o modelo

// Configuração do storage: salva imagens na pasta 'uploads/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/')); // Caminho absoluto para a pasta uploads/
    },
    filename: (req, file, cb) => {
        // Nome único: timestamp + extensão
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filtro opcional: aceita apenas imagens
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas'), false);
    }
};

// Middleware de upload: aceita um arquivo chamado 'imagem'
const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite: 5MB
});

// Exporte o upload para usar no routes (evita duplicação)
exports.upload = upload;

// Função para listar todos os cursos
exports.listCursos = async (req, res) => {
    try {
        const cursos = await Curso.find().sort({ dataInicio: 1 });
        res.status(200).json(cursos);
    } catch (error) {
        console.error("Erro ao listar cursos:", error);
        res.status(500).json({ message: 'Erro ao buscar cursos', error: error.message });
    }
};

// Função para obter um curso por ID
exports.getCursoById = async (req, res) => {
    try {
        const { id } = req.params;
        const curso = await Curso.findById(id);
        if (!curso) {
            return res.status(404).json({ message: 'Curso não encontrado' });
        }
        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar curso', error: error.message });
    }
};

// Função para criar um novo curso
exports.createCurso = async (req, res) => {
    try {
        const dadosCurso = { ...req.body };
        
        // Parse campos que são arrays de objetos (enviados como strings no form-data)
        if (dadosCurso.conteudos && typeof dadosCurso.conteudos === 'string') {
            dadosCurso.conteudos = JSON.parse(dadosCurso.conteudos);
        }
        if (dadosCurso.contatos && typeof dadosCurso.contatos === 'string') {
            dadosCurso.contatos = JSON.parse(dadosCurso.contatos);
        }
        
        // Se imagem foi enviada, salva o caminho relativo
        if (req.file) {
            dadosCurso.imagem = `uploads/${req.file.filename}`;
        }
        
        const novoCurso = new Curso(dadosCurso);
        const cursoSalvo = await novoCurso.save();
        
        res.status(201).json(cursoSalvo);
    } catch (error) {
        console.error("Erro no controller createCurso:", error);
        res.status(500).json({ message: 'Erro ao criar curso', error: error.message });
    }
};

// Função para atualizar um curso
exports.updateCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = { ...req.body };
        
        // Parse campos que são arrays de objetos
        if (dadosAtualizados.conteudos && typeof dadosAtualizados.conteudos === 'string') {
            dadosAtualizados.conteudos = JSON.parse(dadosAtualizados.conteudos);
        }
        if (dadosAtualizados.contatos && typeof dadosAtualizados.contatos === 'string') {
            dadosAtualizados.contatos = JSON.parse(dadosAtualizados.contatos);
        }
        
        // Se nova imagem enviada, atualiza o caminho
        if (req.file) {
            dadosAtualizados.imagem = `uploads/${req.file.filename}`;
        }
        
        const cursoAtualizado = await Curso.findByIdAndUpdate(id, dadosAtualizados, { new: true });
        
        if (!cursoAtualizado) {
            return res.status(404).json({ message: 'Curso não encontrado para atualização' });
        }
        
        res.status(200).json(cursoAtualizado);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar curso', error: error.message });
    }
};

// Função para deletar um curso
exports.deleteCurso = async (req, res) => {
    try {
        const { id } = req.params;
        
        const curso = await Curso.findById(id);
        if (!curso) {
            return res.status(404).json({ message: 'Curso não encontrado para exclusão' });
        }
        
        // Remove o arquivo de imagem se existir
        if (curso.imagem && fs.existsSync(path.join(__dirname, '../../', curso.imagem))) {
            fs.unlinkSync(path.join(__dirname, '../../', curso.imagem));
        }
        
        await Curso.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Curso e imagem deletados com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar curso', error: error.message });
    }
};

// Função para alternar o destaque de um curso
exports.toggleHighlight = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Busca o curso atual
        const curso = await Curso.findById(id);
        
        if (!curso) {
            return res.status(404).json({ message: 'Curso não encontrado' });
        }

        // 2. Inverte o status
        curso.destacado = !curso.destacado;
        
        // 3. Salva a alteração
        await curso.save();
        
        res.status(200).json(curso);
    } catch (error) {
        console.error("Erro ao alternar destaque:", error);
        res.status(500).json({ message: 'Erro ao alternar destaque', error: error.message });
    }
};