-- AnnA Agenda Educacional | fluxo de decisões (ambiente de desenvolvimento)
-- NÃO executar na branch Neon utilizada pelo site publicado.
BEGIN;
CREATE OR REPLACE FUNCTION public.agenda_test_guard_submission()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'pg_catalog' AS $$
BEGIN
  IF OLD.status = 'draft' AND NEW.status = 'submitted' THEN
    IF (to_jsonb(NEW) - 'status' - 'updated_at') IS DISTINCT FROM
       (to_jsonb(OLD) - 'status' - 'updated_at') THEN
      RAISE EXCEPTION 'Submission cannot modify draft contents';
    END IF;
  ELSIF OLD.status IN ('submitted','in_review','needs_clarification') AND
        NEW.status IN ('in_review','needs_clarification','released') AND
        current_user = 'neondb_owner' THEN
    IF (to_jsonb(NEW) - 'status' - 'updated_at') IS DISTINCT FROM
       (to_jsonb(OLD) - 'status' - 'updated_at') THEN
      RAISE EXCEPTION 'Coordinator decision cannot modify contents';
    END IF;
  ELSIF OLD.status <> 'draft' THEN
    RAISE EXCEPTION 'Submitted entries are locked';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.register_coordinator_decision_test(
  p_entry uuid, p_decision text, p_observation text DEFAULT ''
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog' AS $$
DECLARE v_entry public.agenda_authenticated_entries_test%ROWTYPE;
DECLARE v_reviewer uuid;
BEGIN
  v_reviewer := agenda_security.current_user_id();
  IF v_reviewer IS NULL OR p_decision NOT IN ('in_review','needs_clarification','released') THEN
    RAISE EXCEPTION 'Invalid decision or session' USING ERRCODE='42501';
  END IF;
  IF p_decision = 'needs_clarification' AND length(btrim(coalesce(p_observation,''))) = 0 THEN
    RAISE EXCEPTION 'Observation required';
  END IF;
  SELECT * INTO v_entry FROM public.agenda_authenticated_entries_test
    WHERE id=p_entry FOR UPDATE;
  IF NOT FOUND OR v_entry.status NOT IN ('submitted','in_review','needs_clarification')
     OR NOT agenda_security.can_read_coordinator_agenda_test(v_entry.assignment_id) THEN
    RAISE EXCEPTION 'Entry not eligible or coordinator not authorized' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.agenda_coordinator_reviews_test
    (entry_id,reviewer_user_id,decision,observation)
  VALUES (p_entry,v_reviewer,p_decision,btrim(coalesce(p_observation,'')));
  UPDATE public.agenda_authenticated_entries_test SET status=p_decision WHERE id=p_entry;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.register_coordinator_decision_test(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_coordinator_decision_test(uuid,text,text) TO authenticated;
-- Após atualizar a interface, retirar INSERT direto para exigir transação atômica.
COMMIT;
