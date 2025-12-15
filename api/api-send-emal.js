// Arquivo: api/send-email.js

const nodemailer = require('nodemailer');

// As credenciais DEVEM ser armazenadas como Variáveis de Ambiente (SMTP_USER, SMTP_PASS)
const SMTP_USER = process.env.SMTP_USER || 'help.tetyc@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'hgwwodivrzmjlubb'; // SENHA DE APP

// Configurações do transporte SMTP do Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use STARTTLS (porta 587)
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

module.exports = async (req, res) => {
    // A função Serverless só deve aceitar requisições POST
    if (req.method !== 'POST') {
        return res.status(405).send('Método Não Permitido');
    }

    try {
        const { name, email, phone, description } = req.body;
        const phoneDisplay = phone || 'Não Fornecido';
        const date = new Date().toLocaleString('pt-BR', { 
            timeZone: 'America/Sao_Paulo',
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (!name || !email || !description) {
            return res.status(400).json({ success: false, message: 'Nome, Email e Descrição são campos obrigatórios.' });
        }

        // --- TEMPLATE HTML/CSS INLINE QUE GERA O VISUAL SOLICITADO ---
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
                
                <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
                    <h2 style="margin: 0; font-size: 1.5em; letter-spacing: 1px;">TETYC GROUP</h2>
                    <p style="margin-top: 5px; font-size: 1em;">Nova Solicitação de Diagnóstico</p>
                </div>
                
                <div style="padding: 20px;">
                    <p style="margin-bottom: 20px; color: #333;">Uma nova solicitação foi enviada através do site. Detalhes:</p>

                    <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 10px; border-left: 5px solid #000000; border-radius: 4px;">
                        <p style="margin: 0; font-weight: bold; color: #333;">Nome do Cliente:</p>
                        <p style="margin: 5px 0 0; color: #000000;">${name}</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 10px; border-left: 5px solid #000000; border-radius: 4px;">
                        <p style="margin: 0; font-weight: bold; color: #333;">Email:</p>
                        <p style="margin: 5px 0 0; color: #000000;">${email}</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 10px; border-left: 5px solid #000000; border-radius: 4px;">
                        <p style="margin: 0; font-weight: bold; color: #333;">Telefone:</p>
                        <p style="margin: 5px 0 0; color: #000000;">${phoneDisplay}</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-left: 5px solid #000000; border-radius: 4px;">
                        <p style="margin: 0; font-weight: bold; color: #333;">Descrição do Problema:</p>
                        <p style="margin: 5px 0 0; color: #000000; white-space: pre-wrap;">${description}</p>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-left: 5px solid #000000; border-radius: 4px; text-align: left;">
                        <p style="margin: 0; font-weight: bold; color: #333;">Data/Hora da Solicitação:</p>
                        <p style="margin: 5px 0 0; color: #000000;">${date} (BRT)</p>
                    </div>

                    <p style="margin-top: 30px; text-align: center; font-size: 0.9em; color: #555;">
                        <em>Esta é uma notificação automática do sistema Tetyc Group.</em>
                    </p>
                    <p style="text-align: center; font-size: 0.9em; color: #555;">
                        Para responder ao cliente, clique no email acima ou responda diretamente a este email.
                    </p>
                </div>
            </div>
        `;
        // --- FIM DO TEMPLATE ---

        const mailOptions = {
            from: `"Contato Tetyc Site" <${SMTP_USER}>`,
            to: SMTP_USER, // O e-mail de destino é o seu próprio
            subject: `Novo Pedido de Diagnóstico de: ${name}`,
            html: emailHTML,
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: 'Solicitação de diagnóstico enviada com sucesso! Entraremos em contato em breve.' });

    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao processar a solicitação. Tente novamente mais tarde.' });
    }
};
