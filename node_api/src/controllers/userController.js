const User = require('../models/User');
const Evento = require('../models/Evento');
const Curso = require('../models/Curso');
const Oportunidade = require('../models/Oportunidade');



const modelsMap = {
  evento: Evento,
  curso: Curso,
  oportunidade: Oportunidade
};

// [GET] /api/users - Listar todos os usuários (Apenas Admin)
exports.listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, nivelAcesso } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = {};

        if (search) {
            // Busca por nome ou email
            query.$or = [
                { nomeCompleto: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (nivelAcesso) {
            query.nivelAcesso = nivelAcesso;
        }

        const users = await User.find(query)
            .select('-senha') // Garante que a senha não seja enviada
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalUsers = await User.countDocuments(query);

        res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalUsers / parseInt(limit)),
            totalResults: totalUsers,
            users
        });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao listar usuários.', details: error.message });
    }
};

// [GET] /api/users/:id - Obter usuário por ID (Apenas Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-senha');

        if (!user) {
            return res.status(404).send({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ user });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao buscar usuário.', details: error.message });
    }
};

// [PUT] /api/users/:id - Atualizar usuário (Apenas Admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // ❌ Impede alterar senha por aqui
    if (updates.senha) {
      delete updates.senha;
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Aplica updates manualmente
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    await user.save(); // 🔥 middleware roda (nível atualiza)

    const userResponse = user.toObject();
    delete userResponse.senha;

    res.status(200).json({
      message: 'Usuário atualizado com sucesso.',
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro ao atualizar usuário.',
      details: error.message
    });
  }
};



// [DELETE] /api/users/:id - Deletar usuário (Apenas Admin)
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).send({ error: 'Usuário não encontrado.' });
        }

        // TODO: Implementar a exclusão de conteúdos e comentários relacionados

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao deletar usuário.', details: error.message });
    }
};


// ------------------------------------------------------------------
// 🔹 RANKING TOP 3 (MAIOR XP)
// ------------------------------------------------------------------
exports.getTop3Ranking = async (req, res) => {
    try {
        const topUsers = await User.find({ ativo: true })
            .select('nomeCompleto fotoPerfil xp nivel') // só o necessário
            .sort({ xp: -1 }) // maior XP primeiro
            .limit(3);

        res.status(200).json({
            ranking: topUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erro ao buscar ranking'
        });
    }
};


// minha posição no ranking
exports.getMyRankingPosition = async (req, res) => {
    try {
        const userId = req.user.id;

        // 🔹 Busca todos os usuários ordenados
        const users = await User.find({ ativo: true })
            .select('nomeCompleto fotoPerfil xp nivel')
            .sort({ xp: -1, nivel: -1, createdAt: 1 });

        // 🔹 Encontra índice do usuário logado
        const myIndex = users.findIndex(
            u => u._id.toString() === userId
        );

        if (myIndex === -1) {
            return res.status(404).json({
                message: 'Usuário não encontrado no ranking'
            });
        }

        // 🔹 Calcula janela (4 acima e 4 abaixo)
        const start = Math.max(0, myIndex - 4);
        const end = Math.min(users.length, myIndex + 5);

        const rankingSlice = users.slice(start, end).map((user, index) => ({
            posicao: start + index + 1,
            ...user.toObject(),
            isMe: user._id.toString() === userId
        }));

        res.status(200).json({
            minhaPosicao: myIndex + 1,
            totalUsuarios: users.length,
            ranking: rankingSlice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erro ao buscar posição no ranking'
        });
    }
};



// POST /api/users/eventos/:eventoId/lembrar (TOGGLE)
exports.toggleEventoLembrado = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventoId } = req.params;
    const { lembreteEm } = req.body;

    // 🔎 Confere se o evento existe
    const evento = await Evento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    const user = await User.findById(userId);

    const index = user.eventosLembrados.findIndex(
      e => e.evento.toString() === eventoId
    );

    // ❌ Se já existe → remove
    if (index !== -1) {
      user.eventosLembrados.splice(index, 1);
      await user.save();

      return res.status(200).json({
        lembrado: false,
        message: 'Evento removido dos lembretes'
      });
    }

    // ➕ Se não existe → adiciona
    user.eventosLembrados.push({
      evento: eventoId,
      lembreteEm: lembreteEm ? new Date(lembreteEm) : null
    });

    await user.save();

    res.status(201).json({
      lembrado: true,
      message: 'Evento adicionado aos lembretes'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao alternar lembrete do evento' });
  }
};


// GET /api/users/eventos/lembrados
exports.listarEventosLembrados = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'eventosLembrados.evento',
        select: 'titulo data local status imagem xp'
      });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({
      total: user.eventosLembrados.length,
      eventos: user.eventosLembrados
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar eventos lembrados' });
  }
};

// POST /api/users/cursos/:cursoId/lembrar (TOGGLE)
exports.toggleCursoLembrado = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursoId } = req.params;
    const { lembreteEm } = req.body;

    // 🔎 Confere se o curso existe
    const curso = await Curso.findById(cursoId);
    if (!curso) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }

    const user = await User.findById(userId);

    const index = user.cursosLembrados.findIndex(
      c => c.curso.toString() === cursoId
    );

    // ❌ Se já existe → remove
    if (index !== -1) {
      user.cursosLembrados.splice(index, 1);
      await user.save();

      return res.status(200).json({
        lembrado: false,
        message: 'Curso removido dos lembretes'
      });
    }

    // ➕ Se não existe → adiciona
    user.cursosLembrados.push({
      curso: cursoId,
      lembreteEm: lembreteEm ? new Date(lembreteEm) : null
    });

    await user.save();

    res.status(201).json({
      lembrado: true,
      message: 'Curso adicionado aos lembretes'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao alternar lembrete do curso' });
  }
};


// GET /api/users/cursos/lembrados 
exports.listarCursosLembrados = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'cursosLembrados.curso',
        select: 'titulo status descricao dataInicio local imagem xp'
      });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({
      total: user.cursosLembrados.length,
      cursos: user.cursosLembrados
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar cursos lembrados' });
  }
};

// POST /api/users/oportunidades/:oportunidadeId/lembrar (TOGGLE)

exports.toggleOportunidadeLembrada = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oportunidadeId } = req.params;
    const { lembreteEm } = req.body;

    // 🔎 Confere se a oportunidade existe
    const oportunidade = await Oportunidade.findById(oportunidadeId);
    if (!oportunidade) {
      return res.status(404).json({ message: 'Oportunidade não encontrada' });
    }

    const user = await User.findById(userId);

    const index = user.oportunidadesLembradas.findIndex(
      o => o.oportunidade.toString() === oportunidadeId
    );

    // ❌ Se já existe → remove
    if (index !== -1) {
      user.oportunidadesLembradas.splice(index, 1);
      await user.save();

      return res.status(200).json({
        lembrado: false,
        message: 'Oportunidade removida dos lembretes'
      });
    }

    // ➕ Se não existe → adiciona
    user.oportunidadesLembradas.push({
      oportunidade: oportunidadeId,
      lembreteEm: lembreteEm ? new Date(lembreteEm) : null
    });

    await user.save();

    res.status(201).json({
      lembrado: true,
      message: 'Oportunidade adicionada aos lembretes'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao alternar lembrete da oportunidade' });
  }
};


// GET /api/users/oportunidades/lembradas

exports.listarOportunidadesLembradas = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'oportunidadesLembradas.oportunidade',
        select: 'titulo descricao dataInicio local xp'
      });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({
      total: user.oportunidadesLembradas.length,
      oportunidades: user.oportunidadesLembradas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar oportunidades lembradas' });
  }
};


// listar check-ins do usuário
// listar check-ins do usuário
exports.listarCheckins = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "historicoCheckins.refId",
        select: "titulo data local imagem",
      });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Formata o histórico incluindo xpGanho
    const historicoFormatado = user.historicoCheckins.map(item => ({
      tipo: item.tipo,
      titulo: item.refId?.titulo || "",
      data: item.refId?.data || null,
      local: item.refId?.local || "",
      imagem: item.refId?.imagem || "",
      xpGanho: item.xpGanho || 0,
      checkinEm: item.checkinEm, // opcional: incluir data do check-in
    }));

    res.status(200).json({
      total: historicoFormatado.length,
      historico: historicoFormatado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar check-ins", error: error.message });
  }
};




// POST /api/users/like/:tipo/:id  (TOGGLE)
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tipo, id } = req.params;

    const Model = modelsMap[tipo];
    if (!Model) {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    const user = await User.findById(userId);

    if (!user.likes) {
      user.likes = { eventos: [], cursos: [], oportunidades: [] };
    }

    const likesArray = user.likes[`${tipo}s`];
    const index = likesArray.findIndex(
      likeId => likeId.toString() === id
    );

    if (index !== -1) {
      likesArray.splice(index, 1);
      item.likes = Math.max(0, item.likes - 1);

      await user.save();
      await item.save();

      return res.status(200).json({
        liked: false,
        likes: item.likes
      });
    }

    likesArray.push(id);
    item.likes += 1;

    await user.save();
    await item.save();

    res.status(201).json({
      liked: true,
      likes: item.likes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao dar like' });
  }
};




exports.getMyLikes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('likes');

    res.status(200).json(user.likes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar meus likes' });
  }
};
