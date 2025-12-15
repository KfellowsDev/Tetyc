import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para analisar o corpo da requisição JSON
app.use(express.json());

// Importante: Middleware para permitir CORS (Cross-Origin Resource Sharing)
// Necessário para que o front-end (seu HTML) possa fazer a requisição para o servidor do Render.
app.use((req, res, next) => {
    // Permite que qualquer origem (seu site) acesse a API
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


// Rota principal para o envio de e-mail (agora é /send-email, não mais /api/send-email)
app.post('/send-email', async (req, res) => {
    
    // Obter variáveis de ambiente
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
    const TO_EMAIL = process.env.TO_EMAIL;

    // Verificar se as variáveis estão definidas
    if (!EMAIL_USER || !EMAIL_PASSWORD || !TO_EMAIL) {
        console.error("Variáveis de ambiente de e-mail não configuradas.");
        return res.status(500).json({ 
            success: false, 
            message: "Erro de configuração do servidor. Contate o administrador." 
        });
    }

    const { nome, telefone, email, mensagem } = req.body;

    if (!nome || !telefone || !email || !mensagem) {
        return res.status(400).json({ 
            success: false, 
            message: "Por favor, preencha todos os campos obrigatórios." 
        });
    }

    // 1. Configurar o Transportador
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        },
    });

    // 2. Email para o Administrador (Notificação)
    const mailOptionsAdmin = {
        from: `"${nome}" <${email}>`, // Remetente real no formulário
        to: TO_EMAIL, // Seu email de administrador
        subject: `Nova Solicitação de Diagnóstico - ${nome}`,
        html: `
            <h2>Nova Solicitação de Diagnóstico (Website)</h2>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${telefone}</p>
            <p><strong>Mensagem/Descrição:</strong></p>
            <p>${mensagem}</p>
        `,
    };

    // 3. Email de Confirmação para o Cliente
    const mailOptionsClient = {
        from: TO_EMAIL, // Seu email (o remetente)
        to: email, // Email do cliente
        subject: 'Confirmação de Recebimento - Tetyc Group',
        html: `
            <h2>Sua solicitação foi recebida com sucesso, ${nome}!</h2>
            <p>Obrigado por entrar em contato. Sua solicitação de diagnóstico foi recebida e nossa equipe responderá em breve. Abaixo estão os detalhes que você nos enviou:</p>
            <hr>
            <p><strong>Mensagem:</strong> ${mensagem}</p>
            <p><strong>Telefone:</strong> ${telefone}</p>
            <hr>
            <p>Atenciosamente, <br>Equipe Tetyc Group</p>
        `,
    };


    try {
        // Enviar email para o Administrador
        await transporter.sendMail(mailOptionsAdmin);
        // Enviar email de Confirmação para o Cliente
        await transporter.sendMail(mailOptionsClient);

        console.log(`Emails enviados com sucesso para: ${email} (Cliente) e ${TO_EMAIL} (Admin)`);
        
        return res.status(200).json({ 
            success: true, 
            message: "Solicitação enviada com sucesso! Você receberá uma confirmação em seu e-mail." 
        });

    } catch (error) {
        console.error('Erro ao enviar e-mail:', error.message);
        
        // Retorna 500 se falhar no envio SMTP
        return res.status(500).json({ 
            success: false, 
            message: "Ocorreu um erro de conexão. Tente novamente mais tarde." 
        });
    }
});

// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
