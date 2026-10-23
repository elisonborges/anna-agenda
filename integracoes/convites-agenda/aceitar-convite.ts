// AnnA Agenda: aceite isolado de convite. Não implantado.
import postgres from "npm:postgres@3.4.7";
import { jwtVerify, createRemoteJWKSet } from "npm:jose@5.10.0";
import { sha256Hex } from "./invitation-utils.ts";
import { emailMatches } from "./email-match.ts";
import { validTokenFormat } from "./invitation-policy.ts";
import { json, readSmallJson, requestOriginAllowed } from "./http-security.ts";

const authBase = Deno.env.get("NEON_AUTH_BASE_URL");
const authUrl = authBase ? new URL(authBase) : null;
const jwks = authUrl ? createRemoteJWKSet(new URL(authBase!.replace(/\/$/, "") + "/.well-known/jwks.json")) : null;

async function authenticatedUser(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ") || !authUrl || !jwks) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), jwks, {
      issuer: authUrl.origin, audience: authUrl.origin, algorithms: ["EdDSA"]
    });
    return typeof payload.sub === "string" && /^[0-9a-f-]{36}$/i.test(payload.sub) ? payload.sub : null;
  } catch { return null; }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  if (!requestOriginAllowed(req, "https://elisonborges.github.io")) return json({ error: "Origem não permitida" }, 403);
  const userId = await authenticatedUser(req);
  if (!userId) return json({ error: "Sessão inválida" }, 401);
  if (!(req.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return json({ error: "Tipo inválido" }, 415);
  let body: unknown;
  try { body = await readSmallJson(req); } catch { return json({ error: "Dados inválidos" }, 400); }
  const token = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).token : null;
  if (!validTokenFormat(token)) return json({ error: "Convite inválido" }, 400);
  const connection = Deno.env.get("AGENDA_NEON_DATABASE_URL");
  if (!connection) return json({ error: "Serviço indisponível" }, 503);
  const sql = postgres(connection, { max: 1, connect_timeout: 5, idle_timeout: 2, ssl: "require" });
  try {
    const hash = await sha256Hex(token);
    const accepted = await sql.begin(async tx => {
      const invitations = await tx`SELECT i.id,i.institution_id,i.email FROM public.agenda_invitations i
        JOIN public.institutions inst ON inst.id=i.institution_id
        WHERE i.token_hash=${hash} AND i.status='pending' AND i.expires_at>now() AND inst.active=TRUE FOR UPDATE OF i`;
      if (invitations.length !== 1) return false;
      const invitation = invitations[0];
      const users = await tx`SELECT email,"emailVerified" FROM neon_auth."user" WHERE id=${userId}::uuid`;
      if (users.length !== 1 || !emailMatches(invitation.email, users[0].email, users[0].emailVerified)) return false;
      await tx`INSERT INTO public.institution_memberships (institution_id,user_id,role,active)
        VALUES (${invitation.institution_id}::uuid,${userId}::uuid,'institution_admin',TRUE)
        ON CONFLICT (institution_id,user_id,role) DO UPDATE SET active=TRUE`;
      await tx`UPDATE public.agenda_invitations SET status='accepted',accepted_at=now() WHERE id=${invitation.id}::uuid`;
      await tx`INSERT INTO public.agenda_invitation_audit (invitation_id,institution_id,actor_user_id,event_type)
        VALUES (${invitation.id}::uuid,${invitation.institution_id}::uuid,${userId}::uuid,'accepted')`;
      return true;
    });
    return accepted ? json({ ok: true }) : json({ error: "Convite inválido ou identidade não confirmada" }, 403);
  } catch { return json({ error: "Serviço indisponível" }, 503); }
  finally { await sql.end({ timeout: 2 }); }
});
