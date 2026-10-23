# Convites institucionais — ambiente isolado
**Estado:** módulos preparados; não implantados, não testados em runtime, não enviam e-mail.
A API de consulta não comprova identidade; somente indica convite pendente.
O endpoint de emissão continua bloqueado.
A página está desabilitada para senha e cadastro.
Nunca colocar AGENDA_NEON_DATABASE_URL ou RESEND_API_KEY em HTML/GitHub Pages.
Antes de publicar: configurar proteção contra abuso persistente, CORS, autenticação, OTP Neon Auth, validação de e-mail e ativação transacional auditada.
