const Curso = require('../models/Curso'); 

// Função para listar todos os cursos
exports.listCursos = async (req, res) => {
    try {
        // Busca todos os cursos e ordena pela data do curso (mais próximos primeiro)
        // Se preferir ordenar pelos recém-criados, use .sort({ criadoEm: -1 })
        const cursos = await Curso.find().sort({ data: 1 });
        
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
        const novoCurso = new Curso(req.body);
        const cursoSalvo = await novoCurso.save();
        
        res.status(201).json(cursoSalvo);
    } catch (error) {
        console.error("Erro ao criar curso:", error);
        res.status(500).json({ message: 'Erro ao criar curso', error: error.message });
    }
};

// Função para atualizar um curso
exports.updateCurso = async (req, res) => {
    try {
        const { id } = req.params;
        
        // { new: true } garante que o retorno seja o objeto já atualizado
        const cursoAtualizado = await Curso.findByIdAndUpdate(id, req.body, { new: true });
        
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
        
        const cursoDeletado = await Curso.findByIdAndDelete(id);
        
        if (!cursoDeletado) {
            return res.status(404).json({ message: 'Curso não encontrado para exclusão' });
        }
        
        res.status(200).json({ message: 'Curso deletado com sucesso' });
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