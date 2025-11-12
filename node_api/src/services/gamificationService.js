const User = require('../models/User');
const Achievement = require('../models/Achievement');

/**
 * Adiciona pontos à pontuação de um usuário.
 * @param {string} userId - ID do usuário.
 * @param {number} points - Número de pontos a adicionar.
 */
exports.addPoints = async (userId, points) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { pontuacao: points } },
            { new: true }
        );
        console.log(`Pontos adicionados ao usuário ${userId}. Nova pontuação: ${user.pontuacao}`);
        return user;
    } catch (error) {
        console.error(`Erro ao adicionar pontos ao usuário ${userId}:`, error);
        return null;
    }
};

/**
 * Desbloqueia uma conquista para um usuário, se ele ainda não a tiver.
 * @param {string} userId - ID do usuário.
 * @param {string} achievementId - ID da conquista.
 */
exports.unlockAchievement = async (userId, achievementId) => {
    try {
        const user = await User.findById(userId);
        const achievement = await Achievement.findById(achievementId);

        if (!user || !achievement) {
            console.warn(`Usuário ou Conquista não encontrados.`);
            return false;
        }

        // Verifica se a conquista já foi desbloqueada
        if (user.conquistasDesbloqueadas.includes(achievementId)) {
            return false; // Já desbloqueada
        }

        // 1. Adiciona a conquista ao array do usuário
        user.conquistasDesbloqueadas.push(achievementId);

        // 2. Adiciona a pontuação da conquista
        user.pontuacao += achievement.pontuacao;

        await user.save();

        console.log(`Conquista "${achievement.nome}" desbloqueada para o usuário ${userId}.`);
        return true; // Desbloqueada com sucesso

    } catch (error) {
        console.error(`Erro ao desbloquear conquista para o usuário ${userId}:`, error);
        return false;
    }
};

/**
 * Função de exemplo para verificar critérios de desbloqueio (simulação).
 * Em um sistema real, esta função seria mais complexa e acionada por eventos.
 * @param {string} userId - ID do usuário.
 * @param {string} eventType - Tipo de evento que ocorreu (ex: 'post_created', 'event_participated').
 */
exports.checkAchievements = async (userId, eventType) => {
    // Esta é uma função placeholder. A lógica real de verificação de critérios
    // (ex: "participou de 3 eventos") exigiria consultas complexas ao DB
    // e seria acionada após cada ação relevante do usuário.

    // Exemplo: Se o usuário curtiu algo, adiciona 5 pontos
    if (eventType === 'content_liked') {
        await exports.addPoints(userId, 5);
    }

    // Exemplo: Desbloqueia uma conquista de teste (ID fictício)
    // if (eventType === 'event_participated') {
    //     const testAchievementId = '60f8a8b8e6c7d8a9b0c1d2e3'; // ID de uma conquista de teste
    //     await exports.unlockAchievement(userId, testAchievementId);
    // }
};
