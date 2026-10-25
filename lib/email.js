// Envia e-mails pela API da Resend. Nunca lança erro: devolve o resultado.
export async function enviarEmail({ para, assunto, html }) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) return { enviado: false, motivo: "RESEND_API_KEY não configurada" };

  const remetente = process.env.EMAIL_REMETENTE || "Two Sports <onboarding@resend.dev>";

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: remetente, to: [para], subject: assunto, html }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");
      return { enviado: false, motivo: `Resend respondeu ${resposta.status}: ${detalhe}` };
    }
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: `Falha de rede: ${e.message}` };
  }
}