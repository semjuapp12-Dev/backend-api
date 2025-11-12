const User = require('../models/User');
const Content = require('../models/Content');
const Achievement = require('../models/Achievement');

// [GET] /api/dashboard/summary - Obter dados de resumo para o Dashboard (Apenas Admin)
exports.getSummary = async (req, res) => {
    try {
        // 1. Contagem de Usuários
        const totalUsers = await User.countDocuments({ nivelAcesso: 'jovem' });

        // 2. Contagem de Conteúdos
        const totalEvents = await Content.countDocuments({ tipo: 'evento' });
        const totalOpportunities = await Content.countDocuments({ tipo: 'vaga' });
        const totalCourses = await Content.countDocuments({ tipo: 'curso' });

        // 3. Contagem de Conquistas
        const totalAchievements = await Achievement.countDocuments({});

        // 4. Métrica de Engajamento (Exemplo: Média de Pontuação)
        const avgScoreResult = await User.aggregate([
            { $match: { nivelAcesso: 'jovem' } },
            { $group: { _id: null, avgScore: { $avg: '$pontuacao' } } }
        ]);
        const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore.toFixed(2) : 0;

        // 5. Destaque Semanal (Exemplo: o conteúdo mais recente)
        const latestContent = await Content.findOne({})
            .sort({ createdAt: -1 })
            .select('titulo corpo tipo dataInicio dataFim imagens')
            .limit(1);

        res.status(200).json({
            users: {
                total: totalUsers
            },
            content: {
                events: totalEvents,
                opportunities: totalOpportunities,
                courses: totalCourses,
                totalAchievements: totalAchievements
            },
            metrics: {
                averageScore: avgScore
            },
            highlight: latestContent
        });

    } catch (error) {
        res.status(500).send({ error: 'Erro ao obter resumo do dashboard.', details: error.message });
    }
};
