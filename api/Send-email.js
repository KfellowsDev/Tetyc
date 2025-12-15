// api/send-email.js

import nodemailer from 'nodemailer';

// Variáveis de ambiente
const userEmail = process.env.EMAIL_USER;
const userPassword = process.env.EMAIL_PASSWORD;
const targetEmail = process.env.TO_EMAIL;

if (!userEmail || !userPassword || !targetEmail) {
    console.error("Erro de Variáveis de Ambiente: EMAIL_USER, EMAIL_PASSWORD ou TO_EMAIL não configuradas corretamente.");
    // Adicionamos um erro mais informativo para o Vercel logs
    throw new Error("Variáveis de ambiente de e-mail ausentes. Verifique as configurações do Vercel.");
}

// Configuração do transportador Nodemailer
// Usando 'service' para facilitar a configuração com o Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: userEmail,
        pass: userPassword, // Deve ser a App Password para Gmail
    },
    // Adiciona segurança extra (embora 'service: gmail' já defina isso)
    secure: true, // Use true para porta 465, false para outras portas
    port: 465,
});

export default async function (req, res) {
    // Garantir que é um método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido.' });
    }

    const { name, email, phone, description } = req.body;

    // Simples validação dos dados
    if (!name || !email || !description) {
        return res.status(400).json({ success: false, message: 'Nome, e-mail e descrição são obrigatórios.' });
    }

    // 1. E-mail de Notificação para Você (o administrador)
    const adminMailOptions = {
        from: `Tetyc Group <${userEmail}>`,
        to: targetEmail,
        subject: `[NOVO DIAGNÓSTICO] Solicitação de ${name}`,
        html: `
            <h3>Nova Solicitação de Diagnóstico Recebida:</h3>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email do Cliente:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${phone || 'Não fornecido'}</p>
            <hr>
            <h4>Descrição Detalhada do Problema:</h4>
            <p>${description}</p>
            <hr>
            <p>Entre em contato o mais rápido possível para agendar o diagnóstico.</p>
        `,
    };

    // 2. E-mail de Confirmação para o Cliente
    const customerMailOptions = {
        from: `Tetyc Group <${userEmail}>`,
        to: email, // O e-mail do cliente
        subject: `Confirmação de Solicitação de Diagnóstico - Tetyc Group`,
        html: `
            <h3>Olá ${name},</h3>
            <p>Recebemos sua solicitação de diagnóstico com sucesso! Agradecemos o contato.</p>
            <hr>
            <h4>Próximos Passos:</h4>
            <ol>
                <li>Nossa equipe revisará os detalhes fornecidos.</li>
                <li>Entraremos em contato via e-mail ou telefone (se fornecido) nas próximas 24 horas úteis para agendar a análise do seu equipamento.</li>
                <li>Lembre-se que o diagnóstico inicial é cobrado por uma taxa, que será abatida do valor total do serviço, caso você opte por seguir com a execução.</li>
            </ol>
            <hr>
            <p>Detalhes da sua solicitação:</p>
            <p><strong>Descrição:</strong> ${description}</p>
            <p><strong>E-mail de Contato:</strong> ${targetEmail}</p>
            <hr>
            <p>Atenciosamente,<br>Equipe Tetyc Group</p>
            <p style="font-size: 10px; color: #888;">Por favor, não responda a este e-mail. Para dúvidas, use o help.tetyc@gmail.com.</p>
        `,
    };

    try {
        // Envia o e-mail de Notificação (para você)
        await transporter.sendMail(adminMailOptions);
        
        // Envia o e-mail de Confirmação (para o cliente)
        await transporter.sendMail(customerMailOptions);

        return res.status(200).json({ success: true, message: 'Solicitação enviada com sucesso! Um e-mail de confirmação foi enviado para você.' });

    } catch (error) {
        console.error('Erro no envio de e-mail:', error);
        
        // Retorna um erro amigável ao frontend
        return res.status(500).json({ 
            success: false, 
            message: 'Falha ao enviar e-mail. Houve um erro interno de conexão (SMTP). Verifique suas variáveis de ambiente e se a Senha de App do Gmail está correta.' 
        });
    }
}
    
        
